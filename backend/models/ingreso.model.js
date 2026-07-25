const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Ingreso = sequelize.define(
    "ingreso",
    {
        id_ingreso: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_rubro: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El rubro es requerido" }
            }
        },
        id_vivienda: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "La vivienda es requerida" }
            }
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El usuario es requerido" }
            }
        },
        id_alicuota: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        id_multa: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "La descripción es requerida" },
                notEmpty: { msg: "La descripción es requerida" }
            }
        },
        valor_alicuota: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        valor_multa: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        total_pagado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El total pagado es requerido" }
            }
        },
        comprobante: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        fecha_pago: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de pago es requerida" }
            }
        },
        estado: {
            type: DataTypes.ENUM("PENDIENTE", "PAGADO"),
            allowNull: false,
            defaultValue: "PENDIENTE"
        }
    },
    {
        tableName: "ingresos",
        timestamps: true
    }
);

module.exports = Ingreso;

// Definición de relaciones
const Rubro = require("./rubro.model");
const Vivienda = require("./vivienda.model");
const Usuario = require("./usuario.model");
const Alicuota = require("./alicuota.model");
const Multa = require("./multa.model");

Ingreso.belongsTo(Rubro, { foreignKey: "id_rubro" });
Ingreso.belongsTo(Vivienda, { foreignKey: "id_vivienda" });
Ingreso.belongsTo(Usuario, { foreignKey: "id_usuario" });
Ingreso.belongsTo(Alicuota, { foreignKey: "id_alicuota" });
Ingreso.belongsTo(Multa, { foreignKey: "id_multa" });

Rubro.hasMany(Ingreso, { foreignKey: "id_rubro" });
Vivienda.hasMany(Ingreso, { foreignKey: "id_vivienda" });
Usuario.hasMany(Ingreso, { foreignKey: "id_usuario" });
Alicuota.hasMany(Ingreso, { foreignKey: "id_alicuota" });
Multa.hasMany(Ingreso, { foreignKey: "id_multa" });