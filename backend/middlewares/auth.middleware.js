const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt.config");
const { Usuario } = require("../models");

/**
 * Verifica el token JWT (CU-01, postcondición: sesión autenticada).
 * Adjunta el usuario decodificado a req.usuario.
 */
async function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ mensaje: "Token no proporcionado" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        // Verificamos que el usuario siga existiendo y activo,
        // por si fue desactivado después de emitir el token.
        const usuario = await Usuario.findByPk(payload.id_usuario);
        if (!usuario || usuario.estado !== "Activo") {
            return res.status(403).json({ mensaje: "Usuario inactivo. Contacte a la directiva." });
        }

        req.usuario = payload;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
}

/**
 * Middleware de autorización por rol.
 * Uso: authorize(["Directiva"])
 */
function authorize(rolesPermitidos = []) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ mensaje: "No tiene permisos para realizar esta acción" });
        }
        next();
    };
}

module.exports = { verificarToken, authorize };