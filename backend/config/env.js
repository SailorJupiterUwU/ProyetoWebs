require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,

    db: {
        name: process.env.DB_NAME || "condosecure",
        user: process.env.DB_USER || "root",
        pass: process.env.DB_PASS || "root",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        dialect: process.env.DB_DIALECT || "mysql"
    },

    jwtSecret: process.env.JWT_SECRET || "clave_dev"
};

