const CodigoQR = require("../models/codigoQr.model");
const Visitante = require("../models/visitante.model");
const Vivienda = require("../models/vivienda.model");
const Modulo = require("../models/modulo.model");
const { registrarAuditoria } = require("../utils/auditoria.util");

// ==========================================
// 1. VALIDAR CÓDIGO QR (POST /qr/validar)
// ==========================================
module.exports.validar = async (req, res) => {
    try {
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(400).json({ msg: "El código QR es obligatorio" });
        }

        const qr = await CodigoQR.findOne({
            where: { codigo: codigo },
            include: [{ model: Visitante, include: [{ model: Vivienda, as: "viviendaDestino" }] }]
        });

        if (!qr) {
            return res.status(200).json({ valido: false, motivo: "NO_ENCONTRADO" });
        }

        if (qr.estado === "UTILIZADO") {
            return res.status(200).json({ valido: false, motivo: "YA_UTILIZADO" });
        }
        if (qr.estado === "REVOCADO") {
            return res.status(200).json({ valido: false, motivo: "REVOCADO" });
        }
        if (new Date() > new Date(qr.valido_hasta)) {
            return res.status(200).json({ valido: false, motivo: "VENCIDO" });
        }

        const v = qr.visitante;

        return res.status(200).json({
            valido: true,
            visitante: {
                id_qr: qr.id_qr,
                nombre: v ? v.nombre : "",
                apellido: v ? v.apellido : "",
                cedula: v ? v.cedula : "",
                num_personas: v ? v.num_personas : 1,
                vivienda_destino: v && v.viviendaDestino ? v.viviendaDestino.numero : "N/A", // antes: v.vivienda
                tiene_vehiculo: v ? v.tiene_vehiculo : false,
                placa: v ? v.placa : null
            }
        });
    } catch (err) {
        console.error("Error en validar QR:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. REGISTRAR INGRESO (PATCH /qr/:id/ingreso)
// ==========================================
module.exports.registrarIngreso = async (req, res) => {
    try {
        const { id } = req.params;

        const qr = await CodigoQR.findByPk(id, { include: [{ model: Visitante }] });
        if (!qr) {
            return res.status(404).json({ msg: "Código QR no encontrado" });
        }

        qr.estado = "UTILIZADO";
        await qr.save();

        if (qr.visitante) {
            qr.visitante.fecha_hora_ingreso_real = new Date();
            await qr.visitante.save();
        }

        const modulo = await Modulo.findOne({ where: { nombre: "Control QR" } });
        await registrarAuditoria({
            id_usuario: req.usuario?.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     `Ingreso al condominio registrado via QR #${id}`,
            ip_origen:  req.ip,
            detalle:    qr.visitante ? `Visitante: ${qr.visitante.nombre} ${qr.visitante.apellido}` : undefined,
        });

        return res.status(200).json({ msg: "Ingreso registrado" });
    } catch (err) {
        console.error("Error en registrar ingreso QR:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. REGISTRAR SALIDA (PATCH /qr/:id/salida)
// ==========================================
module.exports.registrarSalida = async (req, res) => {
    try {
        const { id } = req.params;

        const qr = await CodigoQR.findByPk(id, { include: [{ model: Visitante }] });
        if (!qr) {
            return res.status(404).json({ msg: "Código QR no encontrado" });
        }

        if (qr.visitante) {
            qr.visitante.fecha_hora_salida_real = new Date();
            await qr.visitante.save();
        }

        const modulo = await Modulo.findOne({ where: { nombre: "Control QR" } });
        await registrarAuditoria({
            id_usuario: req.usuario?.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     `Salida del condominio registrada via QR #${id}`,
            ip_origen:  req.ip,
            detalle:    qr.visitante ? `Visitante: ${qr.visitante.nombre} ${qr.visitante.apellido}` : undefined,
        });

        return res.status(200).json({ msg: "Salida registrada" });
    } catch (err) {
        console.error("Error en registrar salida QR:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 4. REVOCAR QR (PATCH /qr/:id/revocar)
// ==========================================
module.exports.revocar = async (req, res) => {
    try {
        const { id } = req.params;

        const qr = await CodigoQR.findByPk(id);
        if (!qr) {
            return res.status(404).json({ msg: "Código QR no encontrado" });
        }

        qr.estado = "REVOCADO";
        await qr.save();

        const modulo = await Modulo.findOne({ where: { nombre: "Control QR" } });
        await registrarAuditoria({
            id_usuario: req.usuario?.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     `Código QR #${id} revocado`,
            ip_origen:  req.ip,
        });

        return res.status(200).json({ msg: "Código QR revocado" });
    } catch (err) {
        console.error("Error en revocar QR:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
