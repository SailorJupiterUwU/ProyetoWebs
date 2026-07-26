const xlsx = require("xlsx");
const Presupuesto = require("../models/presupuesto.model");
const Rubro = require("../models/rubro.model");
const PresupuestoRubro = require("../models/presupuestoRubro.model");
const Egreso = require("../models/egreso.model");
const Modulo = require("../models/modulo.model");
const Alicuota = require("../models/alicuota.model");
const Vivienda = require("../models/vivienda.model");
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
//    Solo se usa la Hoja 1 del Excel:
//      - Rubros (fila 8+): col[0] = nombre, col[13] = total anual
//      - Total con contingencia: fila siguiente a "SUBTOTAL ANUAL", col+2
//    Las alícuotas se calculan automáticamente desde la BD:
//      valor_mensual = total_presupuesto × vivienda.porcentaje_alicuota / 12
// ==========================================
module.exports.importarExcel = async (req, res) => {
    try {
        const { anio } = req.body;

        if (!anio) {
            return res.status(400).json({ msg: "El año del presupuesto es obligatorio" });
        }
        if (!req.file) {
            return res.status(400).json({ msg: "Se requiere un archivo Excel (.xlsx o .xls)" });
        }

        // ── 1. Leer el archivo guardado por multer ────────────────────────────
        const workbook = xlsx.readFile(req.file.path);
        const hoja     = workbook.Sheets[workbook.SheetNames[0]];
        const filas    = xlsx.utils.sheet_to_json(hoja, { header: 1 });

        // ── 2. Extraer rubros (fila 8 en adelante) ────────────────────────────
        //    col[0] = nombre del rubro (string), col[13] = total anual (número)
        const rubrosDelExcel = [];
        for (let i = 8; i < filas.length; i++) {
            const fila       = filas[i];
            const nombre     = fila[0];
            const totalAnual = fila[13];

            if (!nombre || typeof nombre !== "string") break;
            if (totalAnual && typeof totalAnual === "number" && totalAnual > 0) {
                rubrosDelExcel.push({ nombre: nombre.trim(), total: totalAnual });
            }
        }

        // ── 3. Obtener el TOTAL FINAL con contingencia ────────────────────────
        //    Buscar "SUBTOTAL ANUAL" en cualquier columna; el TOTAL está 2 cols
        //    a la derecha en la fila siguiente (SUBTOTAL | CONTING. | TOTAL)
        let totalFinal = 0;
        for (let i = 0; i < filas.length; i++) {
            const fila = filas[i];
            const colSubtotal = fila.findIndex(
                (celda) => typeof celda === "string" && celda.includes("SUBTOTAL ANUAL")
            );
            if (colSubtotal !== -1) {
                const filaValores = filas[i + 1];
                if (filaValores && filaValores[colSubtotal + 2]) {
                    totalFinal = Number(filaValores[colSubtotal + 2]);
                }
                break;
            }
        }
        // Fallback: suma directa de rubros si no se encontró la fila de TOTAL
        if (totalFinal === 0) {
            totalFinal = rubrosDelExcel.reduce((s, r) => s + r.total, 0);
        }

        // ── 4. Crear el registro del Presupuesto en la BD ─────────────────────
        const nuevoPresupuesto = await Presupuesto.create({
            anio:          Number(anio),
            total:         totalFinal,
            archivo_excel: req.file.filename,
            fecha_carga:   new Date()
        });

        // ── 5. Rubros: buscar/crear en BD y registrar asignación ──────────────
        let rubrosCreados = 0;
        for (const rubroExcel of rubrosDelExcel) {
            const codigoGenerado = `EGR-${rubroExcel.nombre.replace(/\s+/g, "").substring(0, 14).toUpperCase()}`;

            const [rubroEnBD] = await Rubro.findOrCreate({
                where:    { nombre: rubroExcel.nombre },
                defaults: { codigo: codigoGenerado, nombre: rubroExcel.nombre, tipo: "EGRESO" }
            });

            await PresupuestoRubro.upsert({
                id_presupuesto: nuevoPresupuesto.id_presupuesto,
                id_rubro:       rubroEnBD.id_rubro,
                monto_asignado: rubroExcel.total
            });
            rubrosCreados++;
        }

        // ── 6. Calcular y generar alícuotas desde porcentajes en BD ──────────
        //    Fórmula: valor_mensual = total_presupuesto × porcentaje_alicuota / 12
        //    porcentaje_alicuota se guarda como decimal: 0.0358 = 3.58%
        //    Se generan 12 registros (uno por mes) por cada vivienda activa.
        let alicuotasCreadas = 0;
        const viviendas = await Vivienda.findAll({ where: { estado: true } });

        for (const vivienda of viviendas) {
            const porcentaje = Number(vivienda.porcentaje_alicuota);
            if (!porcentaje || porcentaje <= 0) continue;

            // Redondear a 2 decimales
            const valorMensual = Math.round((totalFinal * porcentaje / 12) * 100) / 100;

            for (let mes = 1; mes <= 12; mes++) {
                const existe = await Alicuota.findOne({
                    where: {
                        id_vivienda:    vivienda.id_vivienda,
                        id_presupuesto: nuevoPresupuesto.id_presupuesto,
                        mes,
                        anio:           Number(anio)
                    }
                });
                if (!existe) {
                    const fechaVenc = new Date(Number(anio), mes - 1, 10);
                    await Alicuota.create({
                        id_vivienda:       vivienda.id_vivienda,
                        id_presupuesto:    nuevoPresupuesto.id_presupuesto,
                        mes,
                        anio:              Number(anio),
                        valor_base:        valorMensual,
                        fecha_vencimiento: fechaVenc.toISOString().split("T")[0],
                        estado:            "PENDIENTE"
                    });
                    alicuotasCreadas++;
                }
            }
        }

        // ── 7. Auditoría ──────────────────────────────────────────────────────
        const modulo = await Modulo.findOne({ where: { nombre: "Presupuestos" } });
        await registrarAuditoria({
            id_usuario: req.usuario?.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     `Presupuesto ${anio} importado`,
            ip_origen:  req.ip,
            detalle:    `Archivo: ${req.file.filename} | Rubros: ${rubrosCreados} | Total: $${totalFinal.toFixed(2)} | Alícuotas generadas: ${alicuotasCreadas}`,
        });

        return res.status(201).json({
            id_presupuesto:    nuevoPresupuesto.id_presupuesto,
            msg:               "Presupuesto importado correctamente",
            total:             totalFinal,
            rubros_creados:    rubrosCreados,
            alicuotas_creadas: alicuotasCreadas
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
