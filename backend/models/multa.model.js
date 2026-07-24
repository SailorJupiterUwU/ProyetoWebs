const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Multa = sequelize.define(
    "multa",
    {
        id_multa: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_alicuota: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "La alícuota es requerida" }
            }
        },
        dias_atraso: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Los días de atraso son requeridos" }
            }
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El valor es requerido" }
            }
        },
        fecha_generacion: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de generación es requerida" }
            }
        },
        fecha_actualizacion: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de actualización es requerida" }
            }
        },
        estado: {
            type: DataTypes.ENUM("PENDIENTE", "PAGADA"),
            allowNull: false,
            defaultValue: "PENDIENTE"
        }
    },
    {
        tableName: "multas",
        timestamps: false
    }
);

module.exports = Multa;

// Definición de relaciones
const Alicuota = require("./alicuota.model");

Multa.belongsTo(Alicuota, { foreignKey: "id_alicuota" });
