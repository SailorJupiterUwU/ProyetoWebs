const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Modulo = sequelize.define(
    "modulo",
    {
        id_modulo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: { msg: "El nombre del módulo es requerido" },
                notEmpty: { msg: "El nombre del módulo es requerido" }
            }
        }
    },
    {
        tableName: "modulos",
        timestamps: false
    }
);

module.exports = Modulo;
