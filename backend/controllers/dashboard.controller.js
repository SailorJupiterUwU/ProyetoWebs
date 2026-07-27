const Ingreso = require("../models/ingreso.model");
const Egreso = require("../models/egreso.model");
const Alicuota = require("../models/alicuota.model");
const Multa = require("../models/multa.model");
const Vivienda = require("../models/vivienda.model");
const Rubro = require("../models/rubro.model");
const { Op } = require("sequelize");

// ==========================================
// 1. RESUMEN GENERAL (GET /dashboard/resumen)
// ==========================================
module.exports.resumen = async (req, res) => {
    try {
        const totalIngresosSum = await Ingreso.sum("total_pagado", { where: { estado: "PAGADO" } });
        const totalEgresosSum = await Egreso.sum("valor", { where: { estado: "PAGADO" } });

        const totalIngresos = Number(totalIngresosSum) || 0;
        const totalEgresos = Number(totalEgresosSum) || 0;
        const saldo = totalIngresos - totalEgresos;

        return res.status(200).json({
            total_ingresos: totalIngresos,
            total_egresos: totalEgresos,
            saldo: saldo
        });
    } catch (err) {
        console.error("Error en resumen dashboard:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. INGRESOS VS EGRESOS POR MES (GET /dashboard/ingresos-vs-egresos)
// ==========================================
// ==========================================
// 2. INGRESOS VS EGRESOS POR MES (GET /dashboard/ingresos-vs-egresos)
// ==========================================
module.exports.ingresosVsEgresos = async (req, res) => {
    try {
        const anio = Number(req.query.anio) || new Date().getFullYear();
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

        const inicioAnio = new Date(anio, 0, 1);
        const finAnio = new Date(anio + 1, 0, 1);

        const ingresos = await Ingreso.findAll({
            where: {
                estado: "PAGADO",
                fecha_pago: { [Op.gte]: inicioAnio, [Op.lt]: finAnio }
            },
            attributes: ["fecha_pago", "total_pagado"]
        });

        const egresos = await Egreso.findAll({
            where: {
                estado: "PAGADO",
                fecha_comprobante: { [Op.gte]: inicioAnio, [Op.lt]: finAnio }
            },
            attributes: ["fecha_comprobante", "valor"]
        });

        // Inicializar acumuladores en 0 para los 12 meses
        let data = meses.map((mes) => ({ mes, ingresos: 0, egresos: 0 }));

        for (let i = 0; i < ingresos.length; i++) {
            const mesIdx = new Date(ingresos[i].fecha_pago).getMonth();
            data[mesIdx].ingresos += Number(ingresos[i].total_pagado) || 0;
        }

        for (let j = 0; j < egresos.length; j++) {
            const mesIdx = new Date(egresos[j].fecha_comprobante).getMonth();
            data[mesIdx].egresos += Number(egresos[j].valor) || 0;
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en ingresosVsEgresos dashboard:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. CARTERA VENCIDA Y MULTAS (GET /dashboard/cartera)
// ==========================================
module.exports.cartera = async (req, res) => {
    try {
        const viviendasEnMoraCount = await Alicuota.count({ where: { estado: "EN_MORA" } });
        const multasGeneradasCount = await Multa.count({ where: { estado: "PENDIENTE" } });
        const alicuotasPendientesSum = await Alicuota.sum("valor_base", { where: { estado: "PENDIENTE" } });

        return res.status(200).json({
            viviendas_en_mora: viviendasEnMoraCount,
            multas_generadas: multasGeneradasCount,
            total_pendiente: Number(alicuotasPendientesSum) || 0
        });
    } catch (err) {
        console.error("Error en cartera dashboard:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 4. MOVIMIENTOS RECIENTES (GET /dashboard/movimientos-recientes)
// ==========================================
module.exports.movimientosRecientes = async (req, res) => {
    try {
        let limit = Number(req.query.limit) || 10;

        const ingresos = await Ingreso.findAll({
            include: [{ model: Vivienda }, { model: Rubro }],
            limit: limit,
            order: [["fecha_pago", "DESC"]]
        });

        const egresos = await Egreso.findAll({
            include: [{ model: Rubro }],
            limit: limit,
            order: [["fecha_comprobante", "DESC"]]
        });

        let movimientos = [];

        for (let i = 0; i < ingresos.length; i++) {
            let ing = ingresos[i];
            movimientos.push({
                fecha: ing.fecha_pago,
                casa: ing.vivienda ? ing.vivienda.numero : "N/A",
                rubro: ing.rubro ? ing.rubro.nombre : "Alicuota",
                monto: ing.total_pagado,
                tipo: "INGRESO"
            });
        }

        for (let j = 0; j < egresos.length; j++) {
            let eg = egresos[j];
            movimientos.push({
                fecha: eg.fecha_comprobante,
                casa: "N/A",
                rubro: eg.rubro ? eg.rubro.nombre : "Proveedor",
                monto: eg.valor,
                tipo: "EGRESO"
            });
        }

        // Ordenar por fecha descendente
        movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Recortar al límite
        let data = movimientos.slice(0, limit);

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en movimientosRecientes dashboard:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
