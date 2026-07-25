const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const PeriodoDirectiva = sequelize.define(
    "periodo_directiva",
    {
        id_periodo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de inicio es requerida" }
            }
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        saldo_inicial: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                notNull: { msg: "El saldo inicial es requerido" }
            }
        },
        estado: {
            type: DataTypes.ENUM("ACTIVO", "CERRADO"),
            allowNull: false,
            defaultValue: "ACTIVO"
        }
    },
    {
        tableName: "periodos_directiva",
        timestamps: true
    }
);

module.exports = PeriodoDirectiva;
