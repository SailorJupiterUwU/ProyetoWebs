const { Casa, Usuario, Ingreso } = require("../models");
const { registrarAuditoria } = require("../utils/auditoria.util");

/**
 * Registrar una nueva casa/lote habitacional
 */
exports.crearCasa = async (req, res) => {
    try {
        const { numero_casa, porcentaje_alicuota } = req.body;

        if (!numero_casa || porcentaje_alicuota === undefined) {
            return res.status(400).json({ mensaje: "numero_casa y porcentaje_alicuota son requeridos" });
        }

        const casaExistente = await Casa.findOne({ where: { numero_casa } });
        if (casaExistente) {
            return res.status(409).json({ mensaje: `Ya existe una casa registrada con el número ${numero_casa}` });
        }

        const nuevaCasa = await Casa.create({ numero_casa, porcentaje_alicuota });

        await registrarAuditoria({
            categoria: "Casas",
            accion: "Registro de casa",
            detalle: `Se registró la casa ${nuevaCasa.numero_casa} con alícuota ${nuevaCasa.porcentaje_alicuota}`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(201).json({ mensaje: "Casa registrada correctamente", casa: nuevaCasa });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Listar todas las casas
 */
exports.listarCasas = async (req, res) => {
    try {
        const casas = await Casa.findAll({ order: [["numero_casa", "ASC"]] });
        return res.status(200).json(casas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Obtener una casa por id, incluyendo sus residentes
 */
exports.obtenerCasa = async (req, res) => {
    try {
        const casa = await Casa.findByPk(req.params.id, {
            include: [{ model: Usuario, attributes: { exclude: ["password_hash"] } }]
        });

        if (!casa) {
            return res.status(404).json({ mensaje: "Casa no encontrada" });
        }

        return res.status(200).json(casa);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Actualizar número de casa o porcentaje de alícuota
 */
exports.actualizarCasa = async (req, res) => {
    try {
        const casa = await Casa.findByPk(req.params.id);
        if (!casa) {
            return res.status(404).json({ mensaje: "Casa no encontrada" });
        }

        const { numero_casa, porcentaje_alicuota } = req.body;

        // Si cambia el número de casa, verificar que no choque con otra existente
        if (numero_casa && numero_casa !== casa.numero_casa) {
            const duplicada = await Casa.findOne({ where: { numero_casa } });
            if (duplicada) {
                return res.status(409).json({ mensaje: `Ya existe una casa con el número ${numero_casa}` });
            }
            casa.numero_casa = numero_casa;
        }

        if (porcentaje_alicuota !== undefined) {
            casa.porcentaje_alicuota = porcentaje_alicuota;
        }

        await casa.save();

        await registrarAuditoria({
            categoria: "Casas",
            accion: "Actualización de casa",
            detalle: `Se actualizó la casa ${casa.numero_casa}`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(200).json({ mensaje: "Casa actualizada correctamente", casa });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Eliminar una casa (solo si no tiene usuarios o ingresos asociados)
 */
exports.eliminarCasa = async (req, res) => {
    try {
        const casa = await Casa.findByPk(req.params.id);
        if (!casa) {
            return res.status(404).json({ mensaje: "Casa no encontrada" });
        }

        const tieneResidentes = await Usuario.count({ where: { id_casa: casa.id_casa } });
        const tieneIngresos = await Ingreso.count({ where: { id_casa: casa.id_casa } });

        if (tieneResidentes > 0 || tieneIngresos > 0) {
            return res.status(409).json({
                mensaje: "No se puede eliminar la casa porque tiene residentes o movimientos financieros asociados"
            });
        }

        await casa.destroy();

        await registrarAuditoria({
            categoria: "Casas",
            accion: "Eliminación de casa",
            detalle: `Se eliminó la casa ${casa.numero_casa}`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(200).json({ mensaje: "Casa eliminada correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};