require("dotenv").config();

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || "clave_dev_no_usar_en_produccion",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h", // Postcondición CU-01: token vigente 8 horas
    JWT_RESET_EXPIRES_IN: "15m" // vida corta para el token de recuperación de contraseña
};