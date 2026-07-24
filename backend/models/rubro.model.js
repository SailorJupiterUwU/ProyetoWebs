const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Rubro = sequelize.define(
    "rubro",
    {
        id_rubro: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notNull: { msg: "El código es requerido" },
                notEmpty: { msg: "El código es requerido" }
            }
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "El nombre del rubro es requerido" },
                notEmpty: { msg: "El nombre del rubro es requerido" }
            }
        },
        tipo: {
            type: DataTypes.ENUM("INGRESO", "EGRESO"),
            allowNull: false,
            validate: {
                notNull: { msg: "El tipo de rubro es requerido" }
            }
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        tableName: "rubros",
        timestamps: false
    }
);

module.exports = Rubro;
