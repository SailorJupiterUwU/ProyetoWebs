const { Rol, Usuario } = require("../models");
const { registrarAuditoria } = require("../utils/auditoria.util");

/**
 * Crear un nuevo rol con sus accesos (permisos por módulo)
 * `accesos` se espera como JSON, ej: { "usuarios": ["ver", "crear"], "finanzas": ["ver"] }
 */
exports.crearRol = async (req, res) => {
    try {
        const { nombre, accesos, estado } = req.body;

        if (!nombre) {
            return res.status(400).json({ mensaje: "El nombre del rol es requerido" });
        }

        const rolExistente = await Rol.findOne({ where: { nombre } });
        if (rolExistente) {
            return res.status(409).json({ mensaje: `Ya existe un rol con el nombre "${nombre}"` });
        }

        const nuevoRol = await Rol.create({
            nombre,
            accesos: accesos || {},
            estado: estado !== undefined ? estado : true
        });

        await registrarAuditoria({
            categoria: "Roles",
            accion: "Registro de rol",
            detalle: `Se creó el rol "${nuevoRol.nombre}"`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(201).json({ mensaje: "Rol creado correctamente", rol: nuevoRol });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Listar todos los roles
 */
exports.listarRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll({ order: [["nombre", "ASC"]] });
        return res.status(200).json(roles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Obtener un rol por id
 */
exports.obtenerRol = async (req, res) => {
    try {
        const rol = await Rol.findByPk(req.params.id);
        if (!rol) {
            return res.status(404).json({ mensaje: "Rol no encontrado" });
        }
        return res.status(200).json(rol);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Actualizar nombre o accesos de un rol
 */
exports.actualizarRol = async (req, res) => {
    try {
        const rol = await Rol.findByPk(req.params.id);
        if (!rol) {
            return res.status(404).json({ mensaje: "Rol no encontrado" });
        }

        const { nombre, accesos } = req.body;

        if (nombre && nombre !== rol.nombre) {
            const duplicado = await Rol.findOne({ where: { nombre } });
            if (duplicado) {
                return res.status(409).json({ mensaje: `Ya existe un rol con el nombre "${nombre}"` });
            }
            rol.nombre = nombre;
        }

        if (accesos !== undefined) {
            rol.accesos = accesos;
        }

        await rol.save();

        await registrarAuditoria({
            categoria: "Roles",
            accion: "Actualización de rol",
            detalle: `Se actualizó el rol "${rol.nombre}"`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(200).json({ mensaje: "Rol actualizado correctamente", rol });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Activar/desactivar un rol (en vez de borrado físico, ya que puede
 * tener usuarios históricos asociados)
 */
exports.cambiarEstadoRol = async (req, res) => {
    try {
        const { estado } = req.body;

        if (typeof estado !== "boolean") {
            return res.status(400).json({ mensaje: "El estado debe ser true o false" });
        }

        const rol = await Rol.findByPk(req.params.id);
        if (!rol) {
            return res.status(404).json({ mensaje: "Rol no encontrado" });
        }

        rol.estado = estado;
        await rol.save();

        await registrarAuditoria({
            categoria: "Roles",
            accion: "Cambio de estado de rol",
            detalle: `El rol "${rol.nombre}" pasó a estado ${estado ? "activo" : "inactivo"}`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(200).json({ mensaje: "Estado del rol actualizado", rol });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Eliminar un rol (solo si no tiene usuarios asignados actualmente)
 */
exports.eliminarRol = async (req, res) => {
    try {
        const rol = await Rol.findByPk(req.params.id);
        if (!rol) {
            return res.status(404).json({ mensaje: "Rol no encontrado" });
        }

        const usuariosConEsteRol = await Usuario.count({ where: { id_rol: rol.id_rol } });
        if (usuariosConEsteRol > 0) {
            return res.status(409).json({
                mensaje: "No se puede eliminar el rol porque hay usuarios asignados a él. Desactívalo en su lugar."
            });
        }

        await rol.destroy();

        await registrarAuditoria({
            categoria: "Roles",
            accion: "Eliminación de rol",
            detalle: `Se eliminó el rol "${rol.nombre}"`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(200).json({ mensaje: "Rol eliminado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};