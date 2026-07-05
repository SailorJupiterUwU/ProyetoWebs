const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const RegistroAccesos = sequelize.define(
    "registro_accesos",
    {
        id_pase: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El pase es requerido" }
            }
        },
        fecha_hora_efectiva: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha y hora efectiva es requerida" }
            }
        },
        acceso_permitido: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        mensaje_validacion: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        tableName: "registro_accesos",
        timestamps: false
    }
);

module.exports = RegistroAccesos;