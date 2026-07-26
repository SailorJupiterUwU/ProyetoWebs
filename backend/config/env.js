require("dotenv").config();

module.exports = {
    db: {
        name: process.env.DB_NAME || "condosecure",
        user: process.env.DB_USER || "root",
        pass: process.env.DB_PASS || "root",
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || "mysql",
        sslCa: process.env.DB_SSL_CA || null
    }
};