const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Auditoria = sequelize.define(
    "auditoria",
    {
        fecha_hora: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha y hora es requerida" }
            }
        },
        categoria: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: { msg: "La categoría es requerida" },
                notEmpty: { msg: "La categoría es requerida" }
            }
        },
        accion: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "La acción es requerida" },
                notEmpty: { msg: "La acción es requerida" }
            }
        },
        detalle: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ip_origen: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El usuario es requerido" }
            }
        }
    },
    {
        tableName: "auditorias",
        timestamps: false
    }
);

module.exports = Auditoria;