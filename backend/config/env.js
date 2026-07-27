// backend/config/env.js
require("dotenv").config();

function formatPemCertificate(raw) {
    if (!raw) return null;

    // Quita los marcadores y todo espacio/salto de línea, dejando solo el base64 puro
    const base64 = raw
        .replace(/-----BEGIN CERTIFICATE-----/g, "")
        .replace(/-----END CERTIFICATE-----/g, "")
        .replace(/\s+/g, "");

    // Reconstruye el PEM con saltos de línea reales cada 64 caracteres
    const lines = base64.match(/.{1,64}/g) || [];

    return `-----BEGIN CERTIFICATE-----\n${lines.join("\n")}\n-----END CERTIFICATE-----\n`;
}

module.exports = {
    db: {
        name: process.env.DB_NAME || "condosecure",
        user: process.env.DB_USER || "root",
        pass: process.env.DB_PASS || "root",
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || "mysql",
        sslCa: formatPemCertificate(process.env.DB_SSL_CA)
    }
};