const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(
    env.db.name,
    env.db.user,
    env.db.pass,
    {
        host: env.db.host,
        port: env.db.port,
        dialect: env.db.dialect,
        dialectOptions: env.db.sslCa
            ? {
                ssl: {
                    ca: env.db.sslCa,
                    rejectUnauthorized: true
                }
            }
            : {}
    }
);

module.exports = sequelize;