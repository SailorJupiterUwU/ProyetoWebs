const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../models");
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_RESET_EXPIRES_IN } = require("../config/jwt.config");
const { registrarAuditoria } = require("../utils/auditoria.util");

/**
 * CU-01: Navegación General e Inicio de Sesión
 */
exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Paso 3: validación de formato de entrada
        if (!correo || !password) {
            return res.status(400).json({ mensaje: "Correo y contraseña son requeridos" });
        }

        // Paso 4: verificar existencia del usuario (incluye su rol)
        const usuario = await Usuario.findOne({
            where: { correo },
            include: [{ model: Rol }]
        });

        // FA-01a: no revelar cuál campo falló
        if (!usuario) {
            return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
        }

        // Paso 5 / FA-01b: usuario inactivo
        if (usuario.estado !== "Activo") {
            return res.status(403).json({ mensaje: "Usuario inactivo. Contacte a la directiva." });
        }

        // Paso 6: comparación con hash (bcrypt)
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
        }

        // Paso 7: generar JWT con datos del usuario y su rol
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                id_rol: usuario.id_rol,
                rol: usuario.rol ? usuario.rol.nombre : null
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Paso 8: registrar el login en la bitácora
        await registrarAuditoria({
            categoria: "Autenticación",
            accion: "Inicio de sesión",
            detalle: `El usuario ${usuario.correo} inició sesión`,
            ip_origen: req.ip,
            id_usuario: usuario.id_usuario
        });

        // Paso 9: el frontend decide el redirect según el rol recibido
        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                correo: usuario.correo,
                rol: usuario.rol ? usuario.rol.nombre : null,
                id_casa: usuario.id_casa
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * FA-01c: Recuperación de contraseña — paso 1: solicitar el enlace.
 * Simulado: en vez de enviar un correo real, se loguea el enlace en consola.
 */
exports.solicitarRecuperacion = async (req, res) => {
    try {
        const { correo } = req.body;
        if (!correo) {
            return res.status(400).json({ mensaje: "El correo es requerido" });
        }

        const usuario = await Usuario.findOne({ where: { correo } });

        // Por seguridad, respondemos igual exista o no el correo,
        // para no revelar qué correos están registrados.
        if (usuario) {
            const resetToken = jwt.sign(
                { id_usuario: usuario.id_usuario, proposito: "reset_password" },
                JWT_SECRET,
                { expiresIn: JWT_RESET_EXPIRES_IN }
            );

            const enlaceSimulado = `https://condosecure.app/reset-password?token=${resetToken}`;

            // --- SIMULACIÓN DE ENVÍO DE CORREO ---
            console.log(`[SIMULACIÓN EMAIL] Enviando enlace de recuperación a ${correo}:`);
            console.log(enlaceSimulado);
            // --------------------------------------

            await registrarAuditoria({
                categoria: "Autenticación",
                accion: "Solicitud de recuperación de contraseña",
                detalle: `Se generó un enlace de recuperación para ${correo}`,
                ip_origen: req.ip,
                id_usuario: usuario.id_usuario
            });
        }

        return res.status(200).json({
            mensaje: "Si el correo está registrado, recibirá un enlace de recuperación en breve"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};

/**
 * FA-01c: Recuperación de contraseña — paso 2: restablecer con el token.
 */
exports.restablecerPassword = async (req, res) => {
    try {
        const { token, nuevaPassword } = req.body;
        if (!token || !nuevaPassword) {
            return res.status(400).json({ mensaje: "Token y nueva contraseña son requeridos" });
        }

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ mensaje: "El enlace de recuperación es inválido o expiró" });
        }

        if (payload.proposito !== "reset_password") {
            return res.status(400).json({ mensaje: "Token no válido para esta operación" });
        }

        const usuario = await Usuario.findByPk(payload.id_usuario);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const nuevoHash = await bcrypt.hash(nuevaPassword, 10);
        usuario.password_hash = nuevoHash;
        await usuario.save();

        await registrarAuditoria({
            categoria: "Autenticación",
            accion: "Restablecimiento de contraseña",
            detalle: `El usuario ${usuario.correo} restableció su contraseña`,
            ip_origen: req.ip,
            id_usuario: usuario.id_usuario
        });

        return res.status(200).json({ mensaje: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
};