const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Proveedor = sequelize.define(
    "proveedor",
    {
        id_proveedor: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "El nombre del proveedor es requerido" },
                notEmpty: { msg: "El nombre del proveedor es requerido" }
            }
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        tableName: "proveedores",
        timestamps: false
    }
);

module.exports = Proveedor;
