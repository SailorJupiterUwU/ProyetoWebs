const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const CodigoQR = sequelize.define(
    "codigo_qr",
    {
        id_qr: {
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
        id_visitante: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "El visitante es requerido" }
            }
        },
        codigo: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "El código es requerido" },
                notEmpty: { msg: "El código es requerido" }
            }
        },
        valido_desde: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de inicio de validez es requerida" }
            }
        },
        valido_hasta: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de fin de validez es requerida" }
            }
        },
        fecha_generacion: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de generación es requerida" }
            }
        },
        estado: {
            type: DataTypes.ENUM("PENDIENTE", "UTILIZADO", "VENCIDO", "REVOCADO"),
            allowNull: false,
            defaultValue: "PENDIENTE"
        },
        evidencia: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        tableName: "codigos_qr",
        timestamps: true
    }
);

module.exports = CodigoQR;

// Definición de relaciones
const Usuario = require("./usuario.model");
const Visitante = require("./visitante.model");

CodigoQR.belongsTo(Usuario, { foreignKey: "id_usuario" });
CodigoQR.belongsTo(Visitante, { foreignKey: "id_visitante" });

Usuario.hasMany(CodigoQR, { foreignKey: "id_usuario" });
Visitante.hasOne(CodigoQR, { foreignKey: "id_visitante" });
