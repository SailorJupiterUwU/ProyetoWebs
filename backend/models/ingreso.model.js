const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Ingreso = sequelize.define(
    "ingreso",
    {
        descripcion: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "La descripción es requerida" },
                notEmpty: { msg: "La descripción es requerida" }
            }
        },
        valor_base: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El valor base es requerido" }
            }
        },
        dias_vencidos: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        multa: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El total es requerido" }
            }
        },
        fecha_registro: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de registro es requerida" }
            }
        },
        fecha_actualizacion: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        id_casa: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "La casa es requerida" }
            }
        },
        id_usuario_tesorera: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "La tesorera es requerida" }
            }
        }
    },
    {
        tableName: "ingresos",
        timestamps: false
    }
);

module.exports = Ingreso;