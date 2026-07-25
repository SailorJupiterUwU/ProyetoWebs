const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Persona = sequelize.define(
    "persona",
    {
        id_persona: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombres: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "Los nombres son requeridos" },
                notEmpty: { msg: "Los nombres son requeridos" }
            }
        },
        apellidos: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "Los apellidos son requeridos" },
                notEmpty: { msg: "Los apellidos son requeridos" }
            }
        },
        ci_ruc: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "El CI/RUC es requerido" },
                notEmpty: { msg: "El CI/RUC es requerido" }
            }
        },
        correo: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: { msg: "El correo no tiene un formato válido" }
            }
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        foto: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        tableName: "personas",
        timestamps: true
    }
);

module.exports = Persona;
