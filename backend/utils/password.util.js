const crypto = require("crypto");

/**
 * Genera una contraseña provisional legible (CU-02).
 * En un entorno real esta clave se enviaría por correo; por ahora
 * la devolvemos en la respuesta para simular el flujo completo.
 */
function generarPasswordProvisional() {
    return crypto.randomBytes(6).toString("base64url"); // ej: "aB3xQz9K"
}

module.exports = { generarPasswordProvisional };