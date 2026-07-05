const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Presupuesto = sequelize.define(
    "presupuesto",
    {
        anio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El año es requerido" }
            }
        },
        archivo_excel: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "El archivo Excel es requerido" },
                notEmpty: { msg: "El archivo Excel es requerido" }
            }
        },
        fecha_carga: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de carga es requerida" }
            }
        }
    },
    {
        tableName: "presupuestos",
        timestamps: false
    }
);

module.exports = Presupuesto;