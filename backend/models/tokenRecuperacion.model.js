const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const TokenRecuperacion = sequelize.define(
    "token_recuperacion",
    {
        id_token: {
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
        token: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "El token es requerido" },
                notEmpty: { msg: "El token es requerido" }
            }
        },
        fecha_generacion: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de generación es requerida" }
            }
        },
        fecha_expiracion: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de expiración es requerida" }
            }
        },
        usado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: "tokens_recuperacion",
        timestamps: false
    }
);

module.exports = TokenRecuperacion;

// Definición de relaciones
const Usuario = require("./usuario.model");

TokenRecuperacion.belongsTo(Usuario, { foreignKey: "id_usuario" });
Usuario.hasMany(TokenRecuperacion, { foreignKey: "id_usuario" });
