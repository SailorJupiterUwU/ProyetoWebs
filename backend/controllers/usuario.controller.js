const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { Usuario, Rol, Casa, Auditoria } = require("../models");
const { generarPasswordProvisional } = require("../utils/password.util");
const { registrarAuditoria } = require("../utils/auditoria.util");

/**
 * CU-02: Registrar y Configurar Usuario
 */
exports.registrarUsuario = async (req, res) => {
    try {
        const {
            nombres,
            apellidos,
            ci_ruc,
            id_rol,
            foto,
            correo,
            fecha_ingreso,
            estado,
            id_casa
        } = req.body;

        // FA-02b: campos obligatorios vacíos
        const camposFaltantes = [];
        if (!nombres) camposFaltantes.push("nombres");
        if (!apellidos) camposFaltantes.push("apellidos");
        if (!ci_ruc) camposFaltantes.push("ci_ruc");
        if (!id_rol) camposFaltantes.push("id_rol (ROL)");
        if (!correo) camposFaltantes.push("correo");
        if (!fecha_ingreso) camposFaltantes.push("fecha_ingreso");

        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                mensaje: "Faltan campos obligatorios",
                campos: camposFaltantes
            });
        }

        // Paso 4 / FA-02a: CI/RUC no debe repetirse
        const usuarioExistente = await Usuario.findOne({
            where: { [Op.or]: [{ ci_ruc }, { correo }] }
        });

        if (usuarioExistente) {
            const campoDuplicado = usuarioExistente.ci_ruc === ci_ruc ? "CI/RUC" : "correo";
            return res.status(409).json({
                mensaje: `Ya existe un usuario registrado con ese ${campoDuplicado}`
            });
        }

        // Verificar que el rol exista
        const rol = await Rol.findByPk(id_rol);
        if (!rol) {
            return res.status(400).json({ mensaje: "El rol especificado no existe" });
        }

        // Si se asigna una casa, verificar que exista
        if (id_casa) {
            const casa = await Casa.findByPk(id_casa);
            if (!casa) {
                return res.status(400).json({ mensaje: "La casa especificada no existe" });
            }
        }

        // Paso 5: generar clave provisional cifrada
        const passwordProvisional = generarPasswordProvisional();
        const password_hash = await bcrypt.hash(passwordProvisional, 10);

        const nuevoUsuario = await Usuario.create({
            nombres,
            apellidos,
            ci_ruc,
            correo,
            password_hash,
            foto: foto || null,
            fecha_ingreso,
            estado: estado || "Pendiente",
            id_rol,
            id_casa: id_casa || null
        });

        // Paso 5: asentar el movimiento en Auditoría
        await registrarAuditoria({
            categoria: "Usuarios",
            accion: "Registro de usuario",
            detalle: `Se registró al usuario ${nuevoUsuario.correo} (CI/RUC: ${nuevoUsuario.ci_ruc})`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario // quien ejecuta la acción (la Directiva)
        });

        return res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            usuario: {
                id_usuario: nuevoUsuario.id_usuario,
                nombres: nuevoUsuario.nombres,
                apellidos: nuevoUsuario.apellidos,
                correo: nuevoUsuario.correo,
                estado: nuevoUsuario.estado
            },
            // NOTA: esto se muestra aquí solo porque el envío de correo está simulado.
            // En producción esta clave NUNCA debería devolverse en la respuesta.
            passwordProvisionalSimulada: passwordProvisional
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Listado general de usuarios (soporte para la vista de Gestión de Usuarios)
 */
exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ["password_hash"] },
            include: [{ model: Rol }, { model: Casa }]
        });
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Obtener un usuario específico
 */
exports.obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            attributes: { exclude: ["password_hash"] },
            include: [{ model: Rol }, { model: Casa }]
        });

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        return res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Actualizar datos de un usuario (edición de la ficha por la Directiva)
 */
exports.actualizarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const camposEditables = ["nombres", "apellidos", "foto", "id_rol", "id_casa", "fecha_ingreso"];
        camposEditables.forEach((campo) => {
            if (req.body[campo] !== undefined) {
                usuario[campo] = req.body[campo];
            }
        });

        await usuario.save();

        await registrarAuditoria({
            categoria: "Usuarios",
            accion: "Actualización de usuario",
            detalle: `Se actualizaron datos del usuario ${usuario.correo}`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(200).json({ mensaje: "Usuario actualizado correctamente", usuario });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * Cambiar estado de un usuario (Activo/Inactivo/Pendiente)
 */
exports.cambiarEstadoUsuario = async (req, res) => {
    try {
        const { estado } = req.body;
        const estadosValidos = ["Activo", "Inactivo", "Pendiente"];

        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ mensaje: `El estado debe ser uno de: ${estadosValidos.join(", ")}` });
        }

        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const estadoAnterior = usuario.estado;
        usuario.estado = estado;
        await usuario.save();

        await registrarAuditoria({
            categoria: "Usuarios",
            accion: "Cambio de estado de usuario",
            detalle: `El usuario ${usuario.correo} pasó de "${estadoAnterior}" a "${estado}"`,
            ip_origen: req.ip,
            id_usuario: req.usuario.id_usuario
        });

        return res.status(200).json({ mensaje: "Estado actualizado correctamente", usuario });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * CU-02, paso 6: Consultar Historial de Usuario (bitácora filtrada por usuario)
 * Query params opcionales: fecha_inicio, fecha_fin
 */
exports.consultarHistorialUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_inicio, fecha_fin } = req.query;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const where = { id_usuario: id };

        if (fecha_inicio && fecha_fin) {
            where.fecha_hora = { [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)] };
        }

        const historial = await Auditoria.findAll({
            where,
            order: [["fecha_hora", "DESC"]]
        });

        // FA-07a (reutilizado aquí): sin coincidencias
        if (historial.length === 0) {
            return res.status(200).json({ mensaje: "Búsqueda sin registros asociados", historial: [] });
        }

        return res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};