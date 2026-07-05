const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const Casa = sequelize.define(
    "casa",
    {
        numero_casa: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notNull: { msg: "El número de casa es requerido" },
                notEmpty: { msg: "El número de casa es requerido" }
            }
        },
        porcentaje_alicuota: {
            type: DataTypes.DECIMAL(5, 4),
            allowNull: false,
            validate: {
                notNull: { msg: "El porcentaje de alícuota es requerido" }
            }
        }
    },
    {
        tableName: "casas",
        timestamps: false
    }
);

module.exports = Casa;