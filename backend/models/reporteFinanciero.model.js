const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const ReporteFinanciero = sequelize.define(
    "reporte_financiero",
    {
        id_reporte: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "El usuario es requerido" }
            }
        },
        tipo: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: { msg: "El tipo de reporte es requerido" },
                notEmpty: { msg: "El tipo de reporte es requerido" }
            }
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
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de fin es requerida" }
            }
        },
        fecha_generacion: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "La fecha de generación es requerida" }
            }
        },
        archivo_pdf: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "El archivo PDF es requerido" },
                notEmpty: { msg: "El archivo PDF es requerido" }
            }
        }
    },
    {
        tableName: "reportes_financieros",
        timestamps: true
    }
);

module.exports = ReporteFinanciero;

// Definición de relaciones
const Usuario = require("./usuario.model");

ReporteFinanciero.belongsTo(Usuario, { foreignKey: "id_usuario" });
Usuario.hasMany(ReporteFinanciero, { foreignKey: "id_usuario" });
