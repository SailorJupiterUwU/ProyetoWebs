const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const PaseQR = sequelize.define(
    "pase_qr",
    {
        nombre_visitante: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "El nombre del visitante es requerido" },
                notEmpty: { msg: "El nombre del visitante es requerido" }
            }
        },
        ci_visitante: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notNull: { msg: "El CI del visitante es requerido" },
                notEmpty: { msg: "El CI del visitante es requerido" }
            }
        },
        num_personas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        tiene_vehiculo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        placa: {
            type: DataTypes.STRING(20),
            allowNull: true
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
        estado: {
            type: DataTypes.ENUM("Activo", "Inactivo", "Usado"),
            allowNull: false,
            defaultValue: "Activo"
        },
        hora_ingreso_real: {
            type: DataTypes.DATE,
            allowNull: true
        },
        id_usuario_residente: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El residente es requerido" }
            }
        }
    },
    {
        tableName: "pases_qr",
        timestamps: false
    }
);

module.exports = PaseQR;