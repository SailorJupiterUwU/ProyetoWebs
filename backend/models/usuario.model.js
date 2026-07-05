const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Usuario = sequelize.define(
    "usuario",
    {
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
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "El correo es requerido" },
                notEmpty: { msg: "El correo es requerido" },
                isEmail: { msg: "El correo no tiene un formato válido" }
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "La contraseña es requerida" },
                notEmpty: { msg: "La contraseña es requerida" }
            }
        },
        foto: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        fecha_ingreso: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de ingreso es requerida" }
            }
        },
        estado: {
            type: DataTypes.ENUM("Activo", "Inactivo", "Pendiente"),
            allowNull: false,
            defaultValue: "Pendiente"
        },
        id_rol: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El rol es requerido" }
            }
        },
        id_casa: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        tableName: "usuarios",
        timestamps: false
    }
);

module.exports = Usuario;