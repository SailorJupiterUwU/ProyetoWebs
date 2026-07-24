const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Usuario = sequelize.define(
    "usuario",
    {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "La persona es requerida" }
            }
        },
        id_rol: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El rol es requerido" }
            }
        },
        id_vivienda: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        id_periodo_directiva: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        correo_login: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "El correo de login es requerido" },
                notEmpty: { msg: "El correo de login es requerido" },
                isEmail: { msg: "El correo de login no tiene un formato válido" }
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
        fecha_decision: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de decisión es requerida" }
            }
        },
        estado: {
            type: DataTypes.ENUM("PENDIENTE", "ACTIVO", "INACTIVO", "RECHAZADO"),
            allowNull: false,
            defaultValue: "PENDIENTE"
        },
        motivo_rechazo: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        tableName: "usuarios",
        timestamps: true
    }
);

module.exports = Usuario;

// Definición de relaciones
const Persona = require("./persona.model");
const Rol = require("./rol.model");
const Vivienda = require("./vivienda.model");
const PeriodoDirectiva = require("./periodoDirectiva.model");

Usuario.belongsTo(Persona, { foreignKey: "id_persona" });
Usuario.belongsTo(Rol, { foreignKey: "id_rol" });
Usuario.belongsTo(Vivienda, { foreignKey: "id_vivienda" });
Usuario.belongsTo(PeriodoDirectiva, { foreignKey: "id_periodo_directiva" });

Persona.hasMany(Usuario, { foreignKey: "id_persona" });
Rol.hasMany(Usuario, { foreignKey: "id_rol" });
Vivienda.hasMany(Usuario, { foreignKey: "id_vivienda" });
PeriodoDirectiva.hasMany(Usuario, { foreignKey: "id_periodo_directiva" });