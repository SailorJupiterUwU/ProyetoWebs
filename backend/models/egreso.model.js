const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Egreso = sequelize.define(
    "egreso",
    {
        id_egreso: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_proveedor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El proveedor es requerido" }
            }
        },
        id_rubro: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El rubro es requerido" }
            }
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El usuario es requerido" }
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
        fecha_comprobante: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha del comprobante es requerida" }
            }
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El valor es requerido" }
            }
        },
        estado: {
            type: DataTypes.ENUM("PENDIENTE", "PAGADO"),
            allowNull: false,
            defaultValue: "PENDIENTE"
        },
        num_cheque: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        debito_automatico: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: "egresos",
        timestamps: false
    }
);

module.exports = Egreso;

// Definición de relaciones
const Proveedor = require("./proveedor.model");
const Rubro = require("./rubro.model");
const Usuario = require("./usuario.model");

Egreso.belongsTo(Proveedor, { foreignKey: "id_proveedor" });
Egreso.belongsTo(Rubro, { foreignKey: "id_rubro" });
Egreso.belongsTo(Usuario, { foreignKey: "id_usuario" });