const { Op } = require("sequelize");
const Alicuota = require("../models/alicuota.model");
const Vivienda = require("../models/vivienda.model");
const Multa = require("../models/multa.model");
const Usuario = require("../models/usuario.model");

// ==========================================
// 1. LISTAR ALÍCUOTAS (GET /alicuotas)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const { id_vivienda, mes, anio, estado } = req.query;

        let dondeFiltro = {};
        if (id_vivienda) {
            dondeFiltro.id_vivienda = id_vivienda;
        }
        if (mes) {
            dondeFiltro.mes = mes;
        }
        if (anio) {
            dondeFiltro.anio = anio;
        }
        if (estado) {
            dondeFiltro.estado = estado;
        }

        const alicuotasBDD = await Alicuota.findAll({
            where: dondeFiltro,
            include: [{ model: Vivienda }],
            order: [["anio", "DESC"], ["mes", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < alicuotasBDD.length; i++) {
            let a = alicuotasBDD[i];
            data.push({
                id_alicuota: a.id_alicuota,
                numero_vivienda: a.vivienda ? a.vivienda.numero : "N/A",
                mes: a.mes,
                anio: a.anio,
                valor_base: a.valor_base,
                fecha_vencimiento: a.fecha_vencimiento,
                estado: a.estado
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar alícuotas:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. DETALLE DE ALÍCUOTA (GET /alicuotas/:id)
// ==========================================
module.exports.detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const alicuota = await Alicuota.findByPk(id, {
            include: [
                { model: Vivienda }
            ]
        });

        if (!alicuota) {
            return res.status(404).json({ msg: "Alícuota no encontrada" });
        }

        // Buscar si tiene una multa asociada
        const multa = await Multa.findOne({ where: { id_alicuota: id } });

        return res.status(200).json({
            id_alicuota: alicuota.id_alicuota,
            vivienda: alicuota.vivienda ? { id_vivienda: alicuota.vivienda.id_vivienda, numero: alicuota.vivienda.numero } : null,
            mes: alicuota.mes,
            anio: alicuota.anio,
            valor_base: alicuota.valor_base,
            fecha_vencimiento: alicuota.fecha_vencimiento,
            estado: alicuota.estado,
            multa: multa ? { id_multa: multa.id_multa, valor: multa.valor, estado: multa.estado } : null
        });
    } catch (err) {
        console.error("Error en detalle de alícuota:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. LISTAR ALÍCUOTAS PROPIAS DEL RESIDENTE (GET /alicuotas/mis-alicuotas)
// ==========================================
module.exports.listarPropias = async (req, res) => {
    try {
        let idVivienda = req.usuario ? req.usuario.id_vivienda : null;

        // Si no viene en el token, buscar en la tabla usuario por req.usuario.id_usuario
        if (!idVivienda && req.usuario && req.usuario.id_usuario) {
            const u = await Usuario.findByPk(req.usuario.id_usuario);
            if (u) {
                idVivienda = u.id_vivienda;
            }
        }

        if (!idVivienda) {
            return res.status(200).json({ data: [] });
        }

        const alicuotasBDD = await Alicuota.findAll({
            where: { id_vivienda: idVivienda },
            order: [["anio", "DESC"], ["mes", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < alicuotasBDD.length; i++) {
            let a = alicuotasBDD[i];
            data.push({
                id_alicuota: a.id_alicuota,
                mes: a.mes,
                anio: a.anio,
                valor_base: a.valor_base,
                fecha_vencimiento: a.fecha_vencimiento,
                estado: a.estado
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar mis alícuotas:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
