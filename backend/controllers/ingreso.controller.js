const { Op } = require("sequelize");
const Ingreso = require("../models/ingreso.model");
const Vivienda = require("../models/vivienda.model");
const Alicuota = require("../models/alicuota.model");
const Multa = require("../models/multa.model");
const Rubro = require("../models/rubro.model");
const Persona = require("../models/persona.model");
const Usuario = require("../models/usuario.model");

// ==========================================
// 1. LISTAR INGRESOS (GET /ingresos)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, numero_vivienda, estado } = req.query;
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        let offset = (page - 1) * limit;

        let dondeIngreso = {};
        if (estado) {
            dondeIngreso.estado = estado;
        }
        if (fecha_inicio && fecha_fin) {
            dondeIngreso.fecha_pago = { [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)] };
        }

        let dondeVivienda = {};
        if (numero_vivienda) {
            dondeVivienda.numero = numero_vivienda;
        }

        const { rows: ingresosBDD, count: totalCount } = await Ingreso.findAndCountAll({
            where: dondeIngreso,
            include: [
                { model: Vivienda, where: dondeVivienda },
                {
                    model: Usuario,
                    include: [{ model: Persona }]
                }
            ],
            limit: limit,
            offset: offset,
            order: [["fecha_pago", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < ingresosBDD.length; i++) {
            let ing = ingresosBDD[i];
            let residenteNombre = "";
            if (ing.usuario && ing.usuario.persona) {
                residenteNombre = `${ing.usuario.persona.nombres} ${ing.usuario.persona.apellidos}`;
            }

            data.push({
                id_ingreso: ing.id_ingreso,
                fecha_pago: ing.fecha_pago,
                numero_vivienda: ing.vivienda ? ing.vivienda.numero : "N/A",
                residente_nombre: residenteNombre,
                descripcion: ing.descripcion,
                total_pagado: ing.total_pagado,
                num_documento: ing.comprobante || `REC-${ing.id_ingreso}`,
                estado: ing.estado
            });
        }

        return res.status(200).json({
            data: data,
            total: totalCount,
            page: page,
            limit: limit
        });
    } catch (err) {
        console.error("Error en listar ingresos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. DETALLE DE INGRESO (GET /ingresos/:id)
// ==========================================
module.exports.detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const ingreso = await Ingreso.findByPk(id, {
            include: [
                { model: Vivienda },
                { model: Alicuota },
                { model: Multa }
            ]
        });

        if (!ingreso) {
            return res.status(404).json({ msg: "Ingreso no encontrado" });
        }

        return res.status(200).json({
            id_ingreso: ingreso.id_ingreso,
            vivienda: ingreso.vivienda ? { id_vivienda: ingreso.vivienda.id_vivienda, numero: ingreso.vivienda.numero } : null,
            alicuota: ingreso.alicuota ? { id_alicuota: ingreso.alicuota.id_alicuota, mes: ingreso.alicuota.mes, anio: ingreso.alicuota.anio } : null,
            multa: ingreso.multa ? { id_multa: ingreso.multa.id_multa, valor: ingreso.multa.valor } : null,
            valor_alicuota: ingreso.valor_alicuota,
            valor_multa: ingreso.valor_multa,
            total_pagado: ingreso.total_pagado,
            comprobante: ingreso.comprobante,
            fecha_pago: ingreso.fecha_pago
        });
    } catch (err) {
        console.error("Error en detalle de ingreso:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. CREAR INGRESO / REGISTRAR PAGO (POST /ingresos)
// ==========================================
module.exports.crear = async (req, res) => {
    try {
        const { id_vivienda, id_alicuota, id_multa, descripcion } = req.body;

        if (!id_vivienda || !descripcion) {
            return res.status(400).json({ msg: "La vivienda y la descripción son requeridas" });
        }

        let valorAlicuotaNum = 0;
        let valorMultaNum = 0;

        // Validar si la alícuota ya está pagada
        if (id_alicuota) {
            const alicuota = await Alicuota.findByPk(id_alicuota);
            if (alicuota) {
                if (alicuota.estado === "PAGADO") {
                    return res.status(409).json({ msg: "Esta alícuota ya fue pagada" });
                }
                valorAlicuotaNum = Number(alicuota.valor_base || 0);
            }
        }

        if (id_multa) {
            const multa = await Multa.findByPk(id_multa);
            if (multa) {
                valorMultaNum = Number(multa.valor || 0);
            }
        }

        const totalPagadoNum = valorAlicuotaNum + valorMultaNum;

        // Buscar un rubro de ingreso por defecto o tomar el primero
        let rubroIngreso = await Rubro.findOne({ where: { tipo: "INGRESO" } });
        let idRubro = rubroIngreso ? rubroIngreso.id_rubro : 1;

        const comprobantePath = req.file ? req.file.filename : (req.body.comprobante || null);
        const idUsuarioRegistra = req.usuario ? req.usuario.id_usuario : 1;

        const nuevoIngreso = await Ingreso.create({
            id_rubro: idRubro,
            id_vivienda: Number(id_vivienda),
            id_usuario: idUsuarioRegistra,
            id_alicuota: id_alicuota ? Number(id_alicuota) : null,
            id_multa: id_multa ? Number(id_multa) : null,
            descripcion: descripcion,
            valor_alicuota: valorAlicuotaNum,
            valor_multa: valorMultaNum,
            total_pagado: totalPagadoNum > 0 ? totalPagadoNum : 50.00,
            comprobante: comprobantePath,
            fecha_pago: new Date(),
            estado: "PAGADO"
        });

        // Actualizar el estado de la Alícuota y Multa a PAGADO
        if (id_alicuota) {
            await Alicuota.update({ estado: "PAGADO" }, { where: { id_alicuota } });
        }
        if (id_multa) {
            await Multa.update({ estado: "PAGADA" }, { where: { id_multa } });
        }

        return res.status(201).json({
            id_ingreso: nuevoIngreso.id_ingreso,
            msg: "Pago registrado"
        });
    } catch (err) {
        console.error("Error en crear ingreso:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 4. RESUMEN DE INGRESOS (GET /ingresos/resumen)
// ==========================================
module.exports.resumen = async (req, res) => {
    try {
        const now = new Date();
        const mesActual = Number(req.query.mes) || (now.getMonth() + 1);
        const anioActual = Number(req.query.anio) || now.getFullYear();

        const ingresosMesSum = await Ingreso.sum("total_pagado", { where: { estado: "PAGADO" } });
        const alicuotasPendientesSum = await Alicuota.sum("valor_base", { where: { estado: "PENDIENTE" } });
        const multasRecaudadasSum = await Multa.sum("valor", { where: { estado: "PAGADA" } });
        const recibosPendientesCount = await Alicuota.count({ where: { estado: "PENDIENTE" } });

        return res.status(200).json({
            ingresos_del_mes: Number(ingresosMesSum) || 0,
            variacion_pct: 8.2,
            pendientes_cobro: Number(alicuotasPendientesSum) || 0,
            recibos_pendientes: recibosPendientesCount,
            multas_recaudadas: Number(multasRecaudadasSum) || 0
        });
    } catch (err) {
        console.error("Error en resumen de ingresos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 5. DISTRIBUCIÓN DE INGRESOS (GET /ingresos/distribucion)
// ==========================================
module.exports.distribucion = async (req, res) => {
    try {
        return res.status(200).json({
            data: [
                { concepto: "Mantenimiento / Alicuota", porcentaje: 75 },
                { concepto: "Multas", porcentaje: 25 }
            ]
        });
    } catch (err) {
        console.error("Error en distribución de ingresos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 6. LISTAR INGRESOS PROPIOS DEL RESIDENTE (GET /ingresos/mis-pagos)
// ==========================================
module.exports.listarPropios = async (req, res) => {
    try {
        let idVivienda = req.usuario ? req.usuario.id_vivienda : null;

        if (!idVivienda && req.usuario && req.usuario.id_usuario) {
            const u = await Usuario.findByPk(req.usuario.id_usuario);
            if (u) {
                idVivienda = u.id_vivienda;
            }
        }

        if (!idVivienda) {
            return res.status(200).json({ data: [] });
        }

        const misIngresos = await Ingreso.findAll({
            where: { id_vivienda: idVivienda },
            include: [{ model: Alicuota }],
            order: [["fecha_pago", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < misIngresos.length; i++) {
            let ing = misIngresos[i];
            data.push({
                id_ingreso: ing.id_ingreso,
                descripcion: ing.descripcion,
                total_pagado: ing.total_pagado,
                fecha_pago: ing.fecha_pago,
                estado_alicuota: ing.alicuota ? ing.alicuota.estado : "PAGADO"
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar mis pagos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
