const { Op, DATE, where } = require("sequelize");
const Usuario = require("../models/usuario.model");
const Persona = require("../models/persona.model");
const Rol = require("../models/rol.model");
const Modulo = require("../models/modulo.model");
const Vivienda = require("../models/vivienda.model");
const TokenRecuperacion = require("../models/tokenRecuperacion.model");

const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_RESET_EXPIRES_IN } = require("../config/jwt.config");
const { registrarAuditoria } = require("../utils/auditoria.util");

// Función auxiliar para generar el Token JWT
const generateToken = (id_usuario, id_rol, rolNombre) => {
    return JWT.sign({ id_usuario, id_rol, rol: rolNombre }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ==========================================
// 1. LOGIN DE USUARIO
// ==========================================
module.exports.login = async (req, res) => {
    const { correo_login, password } = req.body;

    if (!correo_login || !password) {
        return res.status(400).json({ msg: "Correo y contraseña son requeridos" });
    }

    try {
        // Buscar el usuario por correo_login incluyendo su Persona, Rol y Módulos asociados
        const usuarioEncontrado = await Usuario.findOne({
            where: { correo_login },
            include: [
                {
                    model: Persona,
                    attributes: ["id_persona", "nombres", "apellidos", "foto"]
                },
                {
                    model: Rol,
                    attributes: ["id_rol", "nombre"],
                    include: [
                        {
                            model: Modulo,
                            attributes: ["nombre"],
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        // Validar si el usuario existe
        if (!usuarioEncontrado) {
            return res.status(401).json({ msg: "Correo o contraseña incorrectos" });
        }

        // Validar la contraseña encriptada con bcrypt
        const esPasswordValido = await bcrypt.compare(password, usuarioEncontrado.password_hash);
        if (!esPasswordValido) {
            const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
            await registrarAuditoria({
                id_usuario: usuarioEncontrado.id_usuario,
                id_modulo:  modulo?.id_modulo,
                accion:     "Intento de inicio de sesión fallido (contraseña incorrecta)",
                ip_origen:  req.ip,
            });
            return res.status(401).json({ msg: "Correo o contraseña incorrectos" });
        }

        // Validar el estado de la cuenta del usuario
        if (usuarioEncontrado.estado === "PENDIENTE") {
            return res.status(403).json({ msg: "Tu cuenta está pendiente de aprobación" });
        }
        if (usuarioEncontrado.estado === "RECHAZADO") {
            return res.status(403).json({ msg: "Tu cuenta fue rechazada" });
        }
        if (usuarioEncontrado.estado === "INACTIVO") {
            return res.status(403).json({ msg: "Tu cuenta está inactiva" });
        }

        // Extraer los nombres de los módulos permitidos
        let modulosNombres = [];
        if (usuarioEncontrado.rol && usuarioEncontrado.rol.modulos) {
            modulosNombres = usuarioEncontrado.rol.modulos.map(m => m.nombre);
        }

        // Extraer datos de la Persona asociada 
        let idPersona = null;
        let nombresPersona = "";
        let apellidosPersona = "";
        let fotoPersona = null;

        if (usuarioEncontrado.persona) {
            idPersona = usuarioEncontrado.persona.id_persona;
            nombresPersona = usuarioEncontrado.persona.nombres;
            apellidosPersona = usuarioEncontrado.persona.apellidos;
            fotoPersona = usuarioEncontrado.persona.foto;
        }

        // Extraer datos del Rol 
        let idRol = null;
        let nombreRol = "";

        if (usuarioEncontrado.rol) {
            idRol = usuarioEncontrado.rol.id_rol;
            nombreRol = usuarioEncontrado.rol.nombre;
        }

        // Generar token JWT
        const token = generateToken(usuarioEncontrado.id_usuario, usuarioEncontrado.id_rol, nombreRol);

        // Registrar el inicio de sesión exitoso en la bitácora
        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria({
            id_usuario: usuarioEncontrado.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     "Inicio de sesión exitoso",
            ip_origen:  req.ip,
        });

        return res.status(200).json({
            token: token,
            usuario: {
                id_usuario: usuarioEncontrado.id_usuario,
                id_persona: idPersona,
                nombres: nombresPersona,
                apellidos: apellidosPersona,
                foto: fotoPersona,
                rol: {
                    id_rol: idRol,
                    nombre: nombreRol
                },
                modulos: modulosNombres
            }
        });
    } catch (err) {
        console.error("Error en login:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. REGISTRO DE USUARIO
// ==========================================
module.exports.registro = async (req, res) => {
    const { nombres, apellidos, ci_ruc, numero_vivienda, correo_login, password } = req.body;

    if (!nombres || !apellidos || !ci_ruc || !numero_vivienda || !correo_login || !password) {
        return res.status(400).json({ msg: "Todos los campos obligatorios deben ser proporcionados" });
    }

    try {
        // 1. Verificar si la vivienda existe en la base de datos
        const vivienda = await Vivienda.findOne({ where: { numero: numero_vivienda } });
        if (!vivienda) {
            return res.status(400).json({ msg: `La vivienda #${numero_vivienda} no está registrada en el sistema` });
        }

        // 2. Verificar si ya existe un usuario registrado con ese correo de login
        const usuarioExistente = await Usuario.findOne({ where: { correo_login: correo_login } });
        if (usuarioExistente) {
            return res.status(409).json({ msg: "Ya existe una cuenta con ese correo" });
        }

        // 3. Buscar el rol 'RESIDENTE' de forma insensible a mayúsculas/minúsculas
        let rolResidente = await Rol.findOne({
            where: {
                codigo: { [Op.like]: "RESIDENTE" }
            }
        });

        // Si no se encuentra por código, buscar por nombre 'Residente'
        if (!rolResidente) {
            rolResidente = await Rol.findOne({
                where: {
                    nombre: { [Op.like]: "Residente" }
                }
            });
        }

        // ID de rol por defecto si la tabla roles aún no tiene registros (ej: 2)
        let idRolAsignado = 3;
        if (rolResidente) {
            idRolAsignado = rolResidente.id_rol;
        }

        // 4. Encriptar la contraseña con bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Manejar foto si viene cargada por multer
        let fotoPath = null;
        if (req.file) {
            fotoPath = req.file.filename;
        }

        // 6. Crear el registro de la Persona
        const nuevaPersona = await Persona.create({
            nombres: nombres,
            apellidos: apellidos,
            ci_ruc: ci_ruc,
            correo: correo_login,
            foto: fotoPath
        });

        // 7. Crear el Usuario ligado a la Persona creada
        const nuevoUsuario = await Usuario.create({
            id_persona: nuevaPersona.id_persona,
            id_rol: idRolAsignado,
            id_vivienda: vivienda.id_vivienda,
            correo_login: correo_login,
            password_hash: hashedPassword,
            fecha_registro: new Date(),
            estado: "PENDIENTE"
        });

        // Registrar el nuevo registro en la bitácora
        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria({
            id_usuario: nuevoUsuario.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     "Solicitud de registro enviada",
            ip_origen:  req.ip,
            detalle:    `Correo: ${correo_login} | Vivienda: ${numero_vivienda}`,
        });

        return res.status(201).json({ msg: "Solicitud enviada, en espera de aprobación" });
    } catch (err) {
        console.error("Error en registro:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================                                                                                                                            
// 3. RECUPERACIÓN DE CONTRASEÑA                                                                                                                                         
// ==========================================                                                                                                                            
module.exports.recuperarPassword = async (req, res) => {
    const { correo_login } = req.body;

    if (!correo_login) {
        return res.status(400).json({ msg: "El campo correo es obligatorio para la recuperación" });
    }

    try {
        const usuarioEncontrado = await Usuario.findOne({ where: { correo_login } });

        if (usuarioEncontrado) {
            const tokenGenerado = JWT.sign({ id: usuarioEncontrado.id_usuario }, JWT_SECRET, { expiresIn: JWT_RESET_EXPIRES_IN });
            const fechaGeneracion = new Date();
            const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos                                                                                 

            await TokenRecuperacion.create({
                id_usuario: usuarioEncontrado.id_usuario,
                token: tokenGenerado,
                fecha_generacion: fechaGeneracion,
                fecha_expiracion: fechaExpiracion,
                usado: false
            });
        }

        // Siempre responde 200 exista o no el correo                                                                                                    
        return res.status(200).json({ msg: "Si el correo existe, se envió un link de recuperación" });
    } catch (err) {
        console.error("Error en recuperarPassword:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================                                                                                                                            
// 4. RESETEAR CONTRASEÑA                                                                                                                                                
// ==========================================                                                                                                                            
module.exports.resetPassword = async (req, res) => {
    const { token, nueva_password } = req.body;

    if (!token || !nueva_password) {
        return res.status(400).json({ msg: "Se requieren todos los campos para resetear la contraseña" });
    }

    try {
        const registroToken = await TokenRecuperacion.findOne({ where: { token } });

        // Validar si el token existe, si ya fue usado o si ya expiró                                                                                                    
        if (!registroToken || registroToken.usado === true || new Date() > new Date(registroToken.fecha_expiracion)) {
            return res.status(400).json({ msg: "Token inválido o expirado" });
        }

        // Encriptar la nueva contraseña con bcrypt                                                                                                                      
        const salt = await bcrypt.genSalt(10);
        const nueva_password_hashed = await bcrypt.hash(nueva_password, salt);

        // Actualizar la contraseña del usuario
        await Usuario.update(
            { password_hash: nueva_password_hashed },
            { where: { id_usuario: registroToken.id_usuario } }
        );

        // Marcar el token como usado
        await registroToken.update({ usado: true });

        // Registrar el restablecimiento de contraseña en la bitácora
        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria({
            id_usuario: registroToken.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     "Contraseña restablecida mediante token de recuperación",
            ip_origen:  req.ip,
        });

        return res.status(200).json({ msg: "Contraseña actualizada" });
    } catch (err) {
        console.error("Error en resetPassword:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
// ==========================================
// 5. CERRAR SESIÓN (LOGOUT)
// ==========================================
module.exports.logout = async (req, res) => {
    try {
        // req.usuario viene del middleware de autenticación (JWT decodificado)
        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria({
            id_usuario: req.usuario?.id_usuario,
            id_modulo:  modulo?.id_modulo,
            accion:     "Cierre de sesión",
            ip_origen:  req.ip,
        });

        return res.status(200).json({ msg: "Sesión cerrada" });
    } catch (err) {
        console.error("Error en logout:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};