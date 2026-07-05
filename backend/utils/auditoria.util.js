const { Auditoria } = require("../models");

/**
 * Registra una entrada inmutable en la bitácora de auditoría.
 * @param {Object} datos
 * @param {string} datos.categoria - Ej: "Autenticación", "Usuarios", "Finanzas"
 * @param {string} datos.accion - Ej: "Inicio de sesión", "Registro de usuario"
 * @param {string} [datos.detalle]
 * @param {string} [datos.ip_origen]
 * @param {number} datos.id_usuario
 */
async function registrarAuditoria({ categoria, accion, detalle, ip_origen, id_usuario }) {
    try {
        await Auditoria.create({
            fecha_hora: new Date(),
            categoria,
            accion,
            detalle: detalle || null,
            ip_origen: ip_origen || null,
            id_usuario
        });
    } catch (error) {
        // La auditoría nunca debe tumbar el flujo principal, solo se loguea el fallo
        console.error("Error al registrar auditoría:", error.message);
    }
}

module.exports = { registrarAuditoria };