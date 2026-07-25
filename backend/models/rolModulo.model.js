const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.config");

const RolModulo = sequelize.define(
    "rol_modulo",
    {
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: { msg: "El rol es requerido" }
            }
        },
        id_modulo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: { msg: "El módulo es requerido" }
            }
        }
    },
    {
        tableName: "rol_modulos",
        timestamps: false
    }
);

module.exports = RolModulo;

// Definición de relaciones
const Rol = require("./rol.model");
const Modulo = require("./modulo.model");

// Relación muchos a muchos entre Rol y Modulo a través de RolModulo
Rol.belongsToMany(Modulo, { through: RolModulo, foreignKey: "id_rol", otherKey: "id_modulo" });
Modulo.belongsToMany(Rol, { through: RolModulo, foreignKey: "id_modulo", otherKey: "id_rol" });

// Relaciones uno a muchos para cargar con include
RolModulo.belongsTo(Rol, { foreignKey: "id_rol" });
RolModulo.belongsTo(Modulo, { foreignKey: "id_modulo" });
