const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(
    env.db.name,
    env.db.user,
    env.db.pass,
    {
        host: env.db.host,
        port: env.db.port,
        dialect: env.db.dialect
    }
);

module.exports = sequelize;