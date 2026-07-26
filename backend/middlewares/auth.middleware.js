const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt.config");
const Usuario = require("../models/usuario.model");
const Rol = require("../models/rol.model");

/**
 * Verifica el token JWT (CU-01, postcondición: sesión autenticada).
 * Solo valida identidad: que el token sea válido y el usuario esté ACTIVO.
 * Adjunta el payload del token a req.usuario (contiene id_usuario e id_rol).
 */
async function autenticacion(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ mensaje: "Token no proporcionado" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        // Verificamos que el usuario siga existiendo y activo en la BD,
        // por si fue desactivado después de emitir el token.
        const usuario = await Usuario.findByPk(payload.id_usuario);
        if (!usuario || usuario.estado !== "ACTIVO") {
            return res.status(403).json({ mensaje: "Usuario inactivo. Contacte a la directiva." });
        }

        // Solo adjuntamos el payload (id_usuario, id_rol).
        // La resolución del nombre del rol queda a cargo de autorizacion().
        req.usuario = payload;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
}

function autorizacion(rolesPermitidos = []) {
    return async (req, res, next) => {
        try {
            const rol = await Rol.findByPk(req.usuario.id_rol);
            const nombreRol = rol ? rol.nombre : null;

            if (!nombreRol || !rolesPermitidos.includes(nombreRol)) {
                return res.status(403).json({ mensaje: "No tiene permisos para realizar esta acción" });
            }

            next();
        } catch (error) {
            return res.status(500).json({ mensaje: "Error al verificar permisos" });
        }
    };
}

module.exports = {
    autenticacion,
    autorizacion,
    verificarToken: autenticacion,
    authorize: autorizacion
};