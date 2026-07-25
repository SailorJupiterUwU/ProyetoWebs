const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const PresupuestoRubro = sequelize.define(
    "presupuesto_rubro",
    {
        id_presupuesto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: { msg: "El presupuesto es requerido" }
            }
        },
        id_rubro: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: { msg: "El rubro es requerido" }
            }
        },
        monto_asignado: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El monto asignado es requerido" }
            }
        }
    },
    {
        tableName: "presupuesto_rubros",
        timestamps: false
    }
);

module.exports = PresupuestoRubro;

// Definición de relaciones
const Presupuesto = require("./presupuesto.model");
const Rubro = require("./rubro.model");

// Relación muchos a muchos entre Presupuesto y Rubro a través de PresupuestoRubro
Presupuesto.belongsToMany(Rubro, { through: PresupuestoRubro, foreignKey: "id_presupuesto", otherKey: "id_rubro" });
Rubro.belongsToMany(Presupuesto, { through: PresupuestoRubro, foreignKey: "id_rubro", otherKey: "id_presupuesto" });

// Relaciones uno a muchos para cargar con include
PresupuestoRubro.belongsTo(Presupuesto, { foreignKey: "id_presupuesto" });
PresupuestoRubro.belongsTo(Rubro, { foreignKey: "id_rubro" });
