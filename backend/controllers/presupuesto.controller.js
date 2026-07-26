const xlsx = require("xlsx");
const Presupuesto = require("../models/presupuesto.model");
const Rubro = require("../models/rubro.model");
const PresupuestoRubro = require("../models/presupuestoRubro.model");
const Egreso = require("../models/egreso.model");
const Modulo = require("../models/modulo.model");
const { registrarAuditoria } = require("../utils/auditoria.util");

// ==========================================
// 1. LISTAR PRESUPUESTOS (GET /presupuestos)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const presupuestosBDD = await Presupuesto.findAll({ order: [["anio", "DESC"]] });

        let listaPresupuestos = [];
        for (let i = 0; i < presupuestosBDD.length; i++) {
            let p = presupuestosBDD[i];
            listaPresupuestos.push({
                id_presupuesto: p.id_presupuesto,
                anio: p.anio,
                total: p.total,
                fecha_carga: p.fecha_carga
            });
        }

        return res.status(200).json({ data: listaPresupuestos });
    } catch (err) {
        console.error("Error en listar presupuestos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. DETALLE DE PRESUPUESTO (GET /presupuestos/:id)
// ==========================================
module.exports.detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const presupuesto = await Presupuesto.findByPk(id);
        if (!presupuesto) {
            return res.status(404).json({ msg: "Presupuesto no encontrado" });
        }

        return res.status(200).json({
            id_presupuesto: presupuesto.id_presupuesto,
            anio: presupuesto.anio,
            total: presupuesto.total,
            archivo_excel: presupuesto.archivo_excel,
            fecha_carga: presupuesto.fecha_carga
        });
    } catch (err) {
        console.error("Error en detalle de presupuesto:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. IMPORTAR EXCEL (POST /presupuestos/importar)
// ==========================================
module.exports.importarExcel = async (req, res) => {
    try {
        const { anio } = req.body;

        if (!anio) {
            return res.status(400).json({ msg: "El año del presupuesto es obligatorio" });
        }

        let nombreArchivo = "presupuesto.xlsx";
        let rubrosCreadosCount = 0;
        let sumaTotalPresupuesto = 0;

        // Si se subió un archivo a través de multer (req.file)
        if (req.file) {
            nombreArchivo = req.file.filename;

            try {
                // Leer el archivo Excel cargado en memoria/disco
                const workbook = xlsx.readFile(req.file.path);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const filas = xlsx.utils.sheet_to_json(worksheet);

                // Recorrer filas del Excel si contiene información de rubros
                for (let i = 0; i < filas.length; i++) {
                    let fila = filas[i];
                    let codigo = fila.CODIGO || fila.Codigo || `R${i + 1}`;
                    let nombre = fila.NOMBRE || fila.Nombre || fila.CONCEPTO || fila.Concepto || `Rubro ${i + 1}`;
                    let monto = Number(fila.MONTO || fila.Monto || fila.TOTAL || fila.Total || 0);

                    if (monto > 0) {
                        sumaTotalPresupuesto += monto;
                        rubrosCreadosCount++;
                    }
                }
            } catch (excelErr) {
                console.error("Error al procesar Excel:", excelErr);
                return res.status(400).json({ msg: "El archivo está corrupto o no tiene el formato esperado" });
            }
        }

        // Crear o actualizar el Presupuesto en la base de datos
        const nuevoPresupuesto = await Presupuesto.create({
            anio: Number(anio),
            total: sumaTotalPresupuesto,
            archivo_excel: nombreArchivo,
            fecha_carga: new Date()
        });

        const modulo = await Modulo.findOne({ where: { nombre: "Presupuestos" } });
        await registrarAuditoria({
            id_usuario: req.usuario?.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     `Presupuesto ${anio} importado`,
            ip_origen:  req.ip,
            detalle:    `Archivo: ${nombreArchivo} | Rubros: ${rubrosCreadosCount} | Total: $${sumaTotalPresupuesto}`,
        });

        return res.status(201).json({
            id_presupuesto: nuevoPresupuesto.id_presupuesto,
            msg: "Presupuesto importado",
            rubros_creados: rubrosCreadosCount
        });
    } catch (err) {
        console.error("Error en importar presupuestos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 4. LISTAR RUBROS DE UN PRESUPUESTO (GET /presupuestos/:id/rubros)
// ==========================================
module.exports.listarRubros = async (req, res) => {
    try {
        const { id } = req.params;

        const presupuesto = await Presupuesto.findByPk(id);
        if (!presupuesto) {
            return res.status(404).json({ msg: "Presupuesto no encontrado" });
        }

        // Obtener la asignación de rubros para este presupuesto
        const asignaciones = await PresupuestoRubro.findAll({
            where: { id_presupuesto: id },
            include: [{ model: Rubro }]
        });

        let listaRubros = [];
        let totalAsignado = 0;
        let totalEjecutado = 0;
        let totalDisponible = 0;

        for (let i = 0; i < asignaciones.length; i++) {
            let pr = asignaciones[i];
            let montoAsignado = Number(pr.monto_asignado);

            // Calcular gastos ejecutados en la tabla Egreso para este rubro
            let gastoEjecutado = 0;
            const sumaEgresos = await Egreso.sum("valor", {
                where: { id_rubro: pr.id_rubro, estado: "PAGADO" }
            });
            if (sumaEgresos) {
                gastoEjecutado = Number(sumaEgresos);
            }

            let saldoDisponible = montoAsignado - gastoEjecutado;

            totalAsignado += montoAsignado;
            totalEjecutado += gastoEjecutado;
            totalDisponible += saldoDisponible;

            listaRubros.push({
                id_rubro: pr.id_rubro,
                codigo: pr.rubro ? pr.rubro.codigo : "",
                nombre: pr.rubro ? pr.rubro.nombre : "",
                monto_asignado: montoAsignado,
                gasto_ejecutado: gastoEjecutado,
                saldo_disponible: saldoDisponible
            });
        }

        return res.status(200).json({
            data: listaRubros,
            totales: {
                monto_asignado: totalAsignado,
                gasto_ejecutado: totalEjecutado,
                saldo_disponible: totalDisponible
            }
        });
    } catch (err) {
        console.error("Error en listar rubros del presupuesto:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 5. AGREGAR RUBRO AL PRESUPUESTO (POST /presupuestos/:id/rubros)
// ==========================================
module.exports.agregarRubro = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_rubro, monto_asignado } = req.body;

        if (!id_rubro || !monto_asignado) {
            return res.status(400).json({ msg: "El id_rubro y monto_asignado son obligatorios" });
        }

        const presupuesto = await Presupuesto.findByPk(id);
        if (!presupuesto) {
            return res.status(404).json({ msg: "Presupuesto no encontrado" });
        }

        // Crear o actualizar la asignación
        await PresupuestoRubro.upsert({
            id_presupuesto: Number(id),
            id_rubro: Number(id_rubro),
            monto_asignado: Number(monto_asignado)
        });

        // Recalcular el total del presupuesto
        const nuevaSuma = await PresupuestoRubro.sum("monto_asignado", { where: { id_presupuesto: id } });
        presupuesto.total = Number(nuevaSuma) || 0;
        await presupuesto.save();

        const modulo = await Modulo.findOne({ where: { nombre: "Presupuestos" } });
        await registrarAuditoria({
            id_usuario: req.usuario?.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     `Rubro #${id_rubro} asignado al presupuesto #${id}`,
            ip_origen:  req.ip,
            detalle:    `Monto asignado: $${monto_asignado}`,
        });

        return res.status(201).json({ msg: "Rubro asignado al presupuesto" });
    } catch (err) {
        console.error("Error en agregar rubro al presupuesto:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 6. EDITAR MONTO DE RUBRO EN PRESUPUESTO (PUT /presupuestos/:id/rubros/:idRubro)
// ==========================================
module.exports.editarMontoRubro = async (req, res) => {
    try {
        const { id, idRubro } = req.params;
        const { monto_asignado } = req.body;

        if (monto_asignado === undefined) {
            return res.status(400).json({ msg: "El monto_asignado es obligatorio" });
        }

        const asignacion = await PresupuestoRubro.findOne({
            where: { id_presupuesto: id, id_rubro: idRubro }
        });

        if (!asignacion) {
            return res.status(404).json({ msg: "Asignaciones de rubro no encontradas" });
        }

        asignacion.monto_asignado = Number(monto_asignado);
        await asignacion.save();

        // Recalcular el total del presupuesto
        const presupuesto = await Presupuesto.findByPk(id);
        if (presupuesto) {
            const nuevaSuma = await PresupuestoRubro.sum("monto_asignado", { where: { id_presupuesto: id } });
            presupuesto.total = Number(nuevaSuma);
            await presupuesto.save();
        }

        const modulo = await Modulo.findOne({ where: { nombre: "Presupuestos" } });
        await registrarAuditoria({
            id_usuario: req.usuario?.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     `Monto del rubro #${idRubro} en presupuesto #${id} actualizado`,
            ip_origen:  req.ip,
            detalle:    `Nuevo monto: $${monto_asignado}`,
        });

        return res.status(200).json({ msg: "Monto actualizado" });
    } catch (err) {
        console.error("Error en editar monto de rubro:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
