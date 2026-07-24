const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Vivienda = sequelize.define(
    "vivienda",
    {
        id_vivienda: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        numero: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notNull: { msg: "El número de vivienda es requerido" },
                notEmpty: { msg: "El número de vivienda es requerido" }
            }
        }
    },
    {
        tableName: "viviendas",
        timestamps: false
    }
);

module.exports = Vivienda;
