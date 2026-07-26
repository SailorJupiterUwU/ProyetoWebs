const Ingreso = require("../models/ingreso.model");
const Egreso = require("../models/egreso.model");
const Rubro = require("../models/rubro.model");

// ==========================================
// 1. LISTAR HISTORIAL FINANCIERO (GET /historial)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const { id_rubro } = req.query;

        let dondeIngreso = { estado: "PAGADO" };
        let dondeEgreso = { estado: "PAGADO" };

        if (id_rubro) {
            dondeIngreso.id_rubro = id_rubro;
            dondeEgreso.id_rubro = id_rubro;
        }

        const ingresos = await Ingreso.findAll({ where: dondeIngreso, include: [{ model: Rubro }] });
        const egresos = await Egreso.findAll({ where: dondeEgreso, include: [{ model: Rubro }] });

        let data = [];

        for (let i = 0; i < ingresos.length; i++) {
            let ing = ingresos[i];
            data.push({
                fecha: ing.fecha_pago,
                tipo: "INGRESO",
                rubro_nombre: ing.rubro ? ing.rubro.nombre : "Alicuotas",
                monto: ing.total_pagado,
                descripcion: ing.descripcion
            });
        }

        for (let j = 0; j < egresos.length; j++) {
            let eg = egresos[j];
            data.push({
                fecha: eg.fecha_comprobante,
                tipo: "EGRESO",
                rubro_nombre: eg.rubro ? eg.rubro.nombre : "Proveedor",
                monto: eg.valor,
                descripcion: `Factura #${eg.num_factura}`
            });
        }

        data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar historial:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
