const { Op } = require("sequelize");
const Multa = require("../models/multa.model");
const Alicuota = require("../models/alicuota.model");
const Vivienda = require("../models/vivienda.model");
const Usuario = require("../models/usuario.model");

// ==========================================
// 1. LISTAR MULTAS (GET /multas)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const { id_vivienda, estado, fecha_inicio, fecha_fin } = req.query;

        let dondeMulta = {};
        if (estado) {
            dondeMulta.estado = estado;
        }
        if (fecha_inicio && fecha_fin) {
            dondeMulta.fecha_generacion = { [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)] };
        }

        let dondeAlicuota = {};
        if (id_vivienda) {
            dondeAlicuota.id_vivienda = id_vivienda;
        }

        const multasBDD = await Multa.findAll({
            where: dondeMulta,
            include: [
                {
                    model: Alicuota,
                    where: dondeAlicuota,
                    include: [{ model: Vivienda }]
                }
            ],
            order: [["fecha_generacion", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < multasBDD.length; i++) {
            let m = multasBDD[i];
            let numVivienda = "N/A";
            if (m.alicuota && m.alicuota.vivienda) {
                numVivienda = m.alicuota.vivienda.numero;
            }

            data.push({
                id_multa: m.id_multa,
                numero_vivienda: numVivienda,
                dias_atraso: m.dias_atraso,
                valor: m.valor,
                fecha_generacion: m.fecha_generacion,
                estado: m.estado
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar multas:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. DETALLE DE MULTA (GET /multas/:id)
// ==========================================
module.exports.detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const multa = await Multa.findByPk(id, {
            include: [
                {
                    model: Alicuota,
                    include: [{ model: Vivienda }]
                }
            ]
        });

        if (!multa) {
            return res.status(404).json({ msg: "Multa no encontrada" });
        }

        return res.status(200).json({
            id_multa: multa.id_multa,
            alicuota: multa.alicuota ? { id_alicuota: multa.alicuota.id_alicuota, mes: multa.alicuota.mes, anio: multa.alicuota.anio } : null,
            dias_atraso: multa.dias_atraso,
            valor: multa.valor,
            fecha_generacion: multa.fecha_generacion,
            fecha_actualizacion: multa.fecha_actualizacion,
            estado: multa.estado
        });
    } catch (err) {
        console.error("Error en detalle de multa:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. LISTAR MULTAS PROPIAS DEL RESIDENTE (GET /multas/mis-multas)
// ==========================================
module.exports.listarPropias = async (req, res) => {
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

        const multasBDD = await Multa.findAll({
            include: [
                {
                    model: Alicuota,
                    where: { id_vivienda: idVivienda }
                }
            ],
            order: [["fecha_generacion", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < multasBDD.length; i++) {
            let m = multasBDD[i];
            data.push({
                id_multa: m.id_multa,
                mes: m.alicuota ? m.alicuota.mes : null,
                anio: m.alicuota ? m.alicuota.anio : null,
                dias_atraso: m.dias_atraso,
                valor: m.valor,
                estado: m.estado
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar mis multas:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
