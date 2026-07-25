const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Auditoria = sequelize.define(
    "auditoria",
    {
        id_auditoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El usuario es requerido" }
            }
        },
        id_modulo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El módulo es requerido" }
            }
        },
        accion: {
            type: DataTypes.STRING(255),
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
        valor_anterior: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        valor_nuevo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ip_origen: {
            type: DataTypes.STRING(45),
            allowNull: false,
            validate: {
                notNull: { msg: "La IP de origen es requerida" },
                notEmpty: { msg: "La IP de origen es requerida" }
            }
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha es requerida" }
            }
        }
    },
    {
        tableName: "auditorias",
        timestamps: false
    }
);

module.exports = Auditoria;

// Definición de relaciones
const Usuario = require("./usuario.model");
const Modulo = require("./modulo.model");

Auditoria.belongsTo(Usuario, { foreignKey: "id_usuario" });
Auditoria.belongsTo(Modulo, { foreignKey: "id_modulo" });

Usuario.hasMany(Auditoria, { foreignKey: "id_usuario" });
Modulo.hasMany(Auditoria, { foreignKey: "id_modulo" });