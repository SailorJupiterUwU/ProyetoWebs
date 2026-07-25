const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Alicuota = sequelize.define(
    "alicuota",
    {
        id_alicuota: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_vivienda: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "La vivienda es requerida" }
            }
        },
        id_presupuesto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El presupuesto es requerido" }
            }
        },
        mes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El mes es requerido" }
            }
        },
        anio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El año es requerido" }
            }
        },
        valor_base: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El valor base es requerido" }
            }
        },
        fecha_vencimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de vencimiento es requerida" }
            }
        },
        estado: {
            type: DataTypes.ENUM("PENDIENTE", "PAGADO", "EN_MORA"),
            allowNull: false,
            defaultValue: "PENDIENTE"
        }
    },
    {
        tableName: "alicuotas",
        timestamps: false
    }
);

module.exports = Alicuota;

// Definición de relaciones
const Vivienda = require("./vivienda.model");
const Presupuesto = require("./presupuesto.model");
const Multa = require("./multa.model");
const Ingreso = require("./ingreso.model");

Alicuota.belongsTo(Vivienda, { foreignKey: "id_vivienda" });
Alicuota.belongsTo(Presupuesto, { foreignKey: "id_presupuesto" });

Vivienda.hasMany(Alicuota, { foreignKey: "id_vivienda" });
Presupuesto.hasMany(Alicuota, { foreignKey: "id_presupuesto" });
