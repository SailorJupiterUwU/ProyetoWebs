const Auditoria = require("../models/auditoria.model");

// Guarda un registro en la bitácora cada vez que alguien hace algo importante en el sistema
// (login, crear usuario, editar presupuesto, etc.)
async function registrarAuditoria(id_usuario, id_modulo, accion, ip_origen, detalle = null, valor_anterior = null, valor_nuevo = null) {
    try {
        await Auditoria.create({
            id_usuario,
            id_modulo,
            accion,
            ip_origen,
            fecha: new Date(),
            detalle,
            valor_anterior,
            valor_nuevo,
        });
    } catch (error) {
        // Si falla el registro de auditoría no queremos que eso detenga la operación principal
        console.error("Error al registrar auditoría:", error.message);
    }
}

module.exports = { registrarAuditoria };