const Auditoria = require("../models/auditoria.model");

/**
 * Registra una acción en la bitácora de auditoría del sistema.
 *
 * Se llama después de cada operación importante (login, crear, editar, eliminar)
 * para dejar un rastro inmutable de quién hizo qué, cuándo y desde dónde.
 *
 * @param {number} id_usuario      - ID del usuario que realizó la acción
 * @param {number} id_modulo       - ID del módulo donde ocurrió (ej: 1=Auth, 2=Usuarios, 3=Finanzas...)
 * @param {string} accion          - Descripción breve de lo que se hizo (ej: "Inicio de sesión exitoso")
 * @param {string} ip_origen       - Dirección IP desde donde se realizó la acción
 * @param {string} [detalle]       - Información extra opcional (ej: nombre del recurso afectado)
 * @param {string} [valor_anterior] - Valor antes del cambio, para operaciones de edición (opcional)
 * @param {string} [valor_nuevo]    - Valor después del cambio, para operaciones de edición (opcional)
 */
async function registrarAuditoria({ id_usuario, id_modulo, accion, ip_origen, detalle, valor_anterior, valor_nuevo }) {
    try {
        await Auditoria.create({
            id_usuario,
            id_modulo,
            accion,
            ip_origen,
            fecha:           new Date(),
            detalle:         detalle         || null,
            valor_anterior:  valor_anterior  || null,
            valor_nuevo:     valor_nuevo     || null,
        });
    } catch (error) {
        // La auditoría NUNCA debe detener el flujo principal del sistema.
        // Si falla el registro, solo se imprime el error en consola y la operación continúa.
        console.error("⚠️  Error al registrar auditoría:", error.message);
    }
}

module.exports = { registrarAuditoria };