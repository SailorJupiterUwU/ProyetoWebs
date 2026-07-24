const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Visitante = sequelize.define(
    "visitante",
    {
        id_visitante: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_vivienda_destino: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "La vivienda de destino es requerida" }
            }
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "El nombre es requerido" },
                notEmpty: { msg: "El nombre es requerido" }
            }
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "El apellido es requerido" },
                notEmpty: { msg: "El apellido es requerido" }
            }
        },
        cedula: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notNull: { msg: "La cédula es requerida" },
                notEmpty: { msg: "La cédula es requerida" }
            }
        },
        num_personas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                notNull: { msg: "El número de personas es requerido" }
            }
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
        fecha_hora_ingreso_real: {
            type: DataTypes.DATE,
            allowNull: true
        },
        fecha_hora_salida_real: {
            type: DataTypes.DATE,
            allowNull: true
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        tableName: "visitantes",
        timestamps: false
    }
);

module.exports = Visitante;

// Definición de relaciones
const Vivienda = require("./vivienda.model");

Visitante.belongsTo(Vivienda, { foreignKey: "id_vivienda_destino", as: "viviendaDestino" });
Vivienda.hasMany(Visitante, { foreignKey: "id_vivienda_destino", as: "visitantes" });
