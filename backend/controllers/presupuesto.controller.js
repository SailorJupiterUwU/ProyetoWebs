const path = require("path");
const XLSX = require("xlsx");
const { Presupuesto, Casa, Egreso, Ingreso } = require("../models");
const { mapearColumnas } = require("../utils/columnMapper.util");
const { registrarAuditoria } = require("../utils/auditoria.util");
const { Op } = require("sequelize");

// Parámetros del modelo de proyección — ajústalos según la política financiera real del condominio
const MARGEN_CONTINGENCIA = 0.10; // 10% de colchón sobre los egresos históricos

/**
 * Subproceso interno (CU-03, paso 5): "Calcular Alícuota Anual".
 * Distribuye el presupuesto total entre las casas según su porcentaje_alicuota.
 * No persiste nada, solo calcula y devuelve la proyección.
 */
async function calcularAlicuotaAnual(presupuestoTotal) {
    const casas = await Casa.findAll({ attributes: ["id_casa", "numero_casa", "porcentaje_alicuota"] });

    if (casas.length === 0) {
        return {
            error: "No hay casas registradas para calcular alícuotas",
            detalle: casas
        };
    }

    const sumaPorcentajes = casas.reduce((acc, casa) => acc + parseFloat(casa.porcentaje_alicuota), 0);

    const desglose = casas.map((casa) => ({
        id_casa: casa.id_casa,
        numero_casa: casa.numero_casa,
        porcentaje_alicuota: parseFloat(casa.porcentaje_alicuota),
        monto_alicuota_anual: parseFloat((presupuestoTotal * parseFloat(casa.porcentaje_alicuota)).toFixed(2)),
        monto_alicuota_mensual: parseFloat(((presupuestoTotal * parseFloat(casa.porcentaje_alicuota)) / 12).toFixed(2))
    }));

    return {
        presupuestoTotal,
        sumaPorcentajes: parseFloat(sumaPorcentajes.toFixed(4)),
        // FA-03a: si los porcentajes no suman 1 (100%), es una inconsistencia de datos históricos
        alertaInconsistencia: Math.abs(sumaPorcentajes - 1) > 0.001
            ? `Los porcentajes de alícuota suman ${(sumaPorcentajes * 100).toFixed(2)}% en vez de 100%. Requiere ajuste manual en el módulo de Casas.`
            : null,
        desglose
    };
}

/**
 * CU-03, pasos 2-3: "Calcular Presupuesto Anual Automatizado"
 * Proyecta el presupuesto base extrayendo egresos y morosidad del año anterior.
 */
exports.calcularPresupuestoAutomatizado = async (req, res) => {
    try {
        const { anio } = req.body;

        if (!anio) {
            return res.status(400).json({ mensaje: "El año a proyectar es requerido" });
        }

        const anioAnterior = parseInt(anio) - 1;
        const inicioAnioAnterior = new Date(`${anioAnterior}-01-01`);
        const finAnioAnterior = new Date(`${anioAnterior}-12-31`);

        // Paso 3: extraer egresos del año previo (base fija + variable del histórico)
        const egresosAnioAnterior = await Egreso.findAll({
            where: { fecha_emision: { [Op.between]: [inicioAnioAnterior, finAnioAnterior] } }
        });

        const ingresosAnioAnterior = await Ingreso.findAll({
            where: { fecha_registro: { [Op.between]: [inicioAnioAnterior, finAnioAnterior] } }
        });

        // FA-03a: datos históricos insuficientes para proyectar de forma autónoma
        if (egresosAnioAnterior.length === 0) {
            return res.status(200).json({
                mensaje: "Datos históricos insuficientes para la proyección automática",
                alerta: `No se encontraron egresos registrados en ${anioAnterior}. Ajusta manualmente el presupuesto base o carga un archivo complementario.`,
                requiereAjusteManual: true
            });
        }

        const totalEgresosAnioAnterior = egresosAnioAnterior.reduce(
            (acc, egreso) => acc + parseFloat(egreso.valor),
            0
        );

        // Tasa de morosidad histórica: proporción de ingresos que llegaron con días vencidos > 0
        const ingresosConMora = ingresosAnioAnterior.filter((i) => i.dias_vencidos > 0).length;
        const tasaMorosidad = ingresosAnioAnterior.length > 0
            ? ingresosConMora / ingresosAnioAnterior.length
            : 0;

        // Proyección: egresos históricos + margen de contingencia,
        // ajustado al alza si la morosidad histórica fue relevante (>15%)
        const factorAjusteMorosidad = tasaMorosidad > 0.15 ? 1 + tasaMorosidad * 0.5 : 1;
        const presupuestoProyectado = parseFloat(
            (totalEgresosAnioAnterior * (1 + MARGEN_CONTINGENCIA) * factorAjusteMorosidad).toFixed(2)
        );

        // Paso 5: ejecutar el subproceso "Calcular Alícuota Anual"
        const proyeccionAlicuotas = await calcularAlicuotaAnual(presupuestoProyectado);

        // Paso 6: renderizar la "Tabla Visual de Presupuesto" (se devuelve, aún sin persistir)
        return res.status(200).json({
            mensaje: "Proyección calculada correctamente. Valide antes de confirmar.",
            anio: parseInt(anio),
            basadoEn: anioAnterior,
            totalEgresosAnioAnterior: parseFloat(totalEgresosAnioAnterior.toFixed(2)),
            tasaMorosidadHistorica: parseFloat((tasaMorosidad * 100).toFixed(2)),
            presupuestoProyectado,
            ...proyeccionAlicuotas
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * CU-03, paso 4: "Carga de Presupuesto con Mapeo Inteligente"
 * Recibe un archivo Excel/CSV, identifica semánticamente las columnas
 * (Lote/Vivienda/Casa, Valor/Monto/Presupuesto) y arma una tabla visual
 * para validación, sin persistir todavía.
 */
exports.cargarPresupuestoConMapeoInteligente = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ mensaje: "Debe adjuntar un archivo (.xlsx, .xls o .csv)" });
        }

        const libro = XLSX.readFile(req.file.path);
        const nombreHoja = libro.SheetNames[0];
        const hoja = libro.Sheets[nombreHoja];

        // header: 1 -> nos da un arreglo de arreglos (fila por fila) en vez de asumir claves fijas
        const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, blankrows: false });

        if (filas.length < 2) {
            return res.status(400).json({ mensaje: "El archivo no contiene datos suficientes (encabezado + al menos una fila)" });
        }

        const [encabezados, ...datos] = filas;
        const { mapeo, columnasNoIdentificadas } = mapearColumnas(encabezados);

        // FA-03a: el motor de parsing no logró identificar las columnas críticas
        if (mapeo.numero_casa === undefined || mapeo.valor === undefined) {
            return res.status(422).json({
                mensaje: "No se pudieron identificar las columnas necesarias en el archivo",
                columnasDetectadas: encabezados,
                columnasNoIdentificadas,
                sugerencia: "Verifica que el archivo tenga una columna para el número de casa/lote y otra para el valor/monto"
            });
        }

        const filasCoincidentes = [];
        const filasSinCoincidencia = [];

        for (const fila of datos) {
            const numeroCasa = fila[mapeo.numero_casa]?.toString().trim();
            const valor = parseFloat(fila[mapeo.valor]);

            if (!numeroCasa || isNaN(valor)) continue;

            const casa = await Casa.findOne({ where: { numero_casa: numeroCasa } });

            if (casa) {
                filasCoincidentes.push({
                    id_casa: casa.id_casa,
                    numero_casa: casa.numero_casa,
                    valor_cargado: valor
                });
            } else {
                filasSinCoincidencia.push({ numero_casa: numeroCasa, valor_cargado: valor });
            }
        }

        // Paso 6: tabla visual para validación de la Directiva antes de confirmar
        return res.status(200).json({
            mensaje: "Archivo procesado. Revise la tabla antes de confirmar la carga.",
            archivoTemporal: req.file.filename,
            columnasMapeadas: mapeo,
            columnasNoIdentificadas,
            filasCoincidentes,
            filasSinCoincidencia,
            alerta: filasSinCoincidencia.length > 0
                ? `${filasSinCoincidencia.length} fila(s) no coinciden con ninguna casa registrada. Corrija el archivo o ajuste manualmente.`
                : null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error al procesar el archivo", error: error.message });
    }
};

/**
 * Confirma y persiste el presupuesto luego de que la Directiva validó
 * la tabla visual (ya sea la proyección automática o la carga de archivo).
 */
exports.confirmarPresupuesto = async (req, res) => {
    try {
        const { anio, archivo_excel } = req.body;

        if (!anio) {
            return res.status(400).json({ mensaje: "El año es requerido" });
        }

        const presupuestoExistente = await Presupuesto.findOne({ where: { anio } });
        if (presupuestoExistente) {
            return res.status(409).json({ mensaje: `Ya existe un presupuesto confirmado para el año ${anio}` });
        }

        const nuevoPresupuesto = await Presupuesto.create({
            anio,
            archivo_excel: archivo_excel || "calculo_automatizado.json",
            fecha_carga: new Date()
        });

        await registrarAuditoria({
            categoria: "Finanzas",
            accion: "Confirmación de presupuesto anual",
            detalle: `Se confirmó el presupuesto del año ${anio}`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(201).json({ mensaje: "Presupuesto confirmado correctamente", presupuesto: nuevoPresupuesto });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Listar presupuestos históricos
 */
exports.listarPresupuestos = async (req, res) => {
    try {
        const presupuestos = await Presupuesto.findAll({ order: [["anio", "DESC"]] });
        return res.status(200).json(presupuestos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Obtener un presupuesto por id junto con la tabla visual de alícuotas recalculada
 */
exports.obtenerPresupuesto = async (req, res) => {
    try {
        const presupuesto = await Presupuesto.findByPk(req.params.id);
        if (!presupuesto) {
            return res.status(404).json({ mensaje: "Presupuesto no encontrado" });
        }

        // Nota: aquí asumimos que el presupuesto ya tiene un monto total asociado
        // a nivel de negocio; si tu modelo de Presupuesto no guarda el monto total,
        // dime y le agregamos ese campo para no tener que recalcularlo cada vez.
        return res.status(200).json(presupuesto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

module.exports.calcularAlicuotaAnual = calcularAlicuotaAnual;