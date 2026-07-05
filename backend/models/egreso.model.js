const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Egreso = sequelize.define(
    "egreso",
    {
        beneficiario: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "El beneficiario es requerido" },
                notEmpty: { msg: "El beneficiario es requerido" }
            }
        },
        num_factura: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: { msg: "El número de factura es requerido" },
                notEmpty: { msg: "El número de factura es requerido" }
            }
        },
        rubro: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "El rubro es requerido" },
                notEmpty: { msg: "El rubro es requerido" }
            }
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El valor es requerido" }
            }
        },
        fecha_emision: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de emisión es requerida" }
            }
        },
        estado: {
            type: DataTypes.ENUM("Pendiente", "Pagado"),
            allowNull: false,
            defaultValue: "Pendiente"
        },
        num_cheque: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        debito_automatico: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        tableName: "egresos",
        timestamps: false
    }
);

module.exports = Egreso;