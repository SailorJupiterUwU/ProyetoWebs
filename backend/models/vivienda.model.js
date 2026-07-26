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
        },
        porcentaje_alicuota: {
            type: DataTypes.DECIMAL(5, 4),
            allowNull: false,
            validate: {
                notNull: { msg: "El porcentaje de alícuota es requerido" },
                min: { args: [0], msg: "El porcentaje no puede ser negativo" },
                max: { args: [1], msg: "El porcentaje no puede ser mayor a 1 (100%)" }
            }
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        tableName: "viviendas",
        timestamps: true
    }
);

module.exports = Vivienda;