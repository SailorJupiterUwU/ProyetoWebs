const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Rol = sequelize.define(
    "rol",
    {
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: { msg: "El nombre del rol es requerido" },
                notEmpty: { msg: "El nombre del rol es requerido" }
            }
        },
        accesos: {
            type: DataTypes.JSON,
            allowNull: true
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        tableName: "roles",
        timestamps: false
    }
);

module.exports = Rol;