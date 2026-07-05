const Casa = require("./casa.model");
const Rol = require("./rol.model");
const Usuario = require("./usuario.model");
const Presupuesto = require("./presupuesto.model");
const Ingreso = require("./ingreso.model");
const Egreso = require("./egreso.model");
const PaseQR = require("./paseQr.model");
const RegistroAccesos = require("./registroAccesos.model");
const Auditoria = require("./auditoria.model");

// Casa 1 -- 0..* Usuario
Casa.hasMany(Usuario, { foreignKey: "id_casa" });
Usuario.belongsTo(Casa, { foreignKey: "id_casa" });

// Rol 1 -- 0..* Usuario
Rol.hasMany(Usuario, { foreignKey: "id_rol" });
Usuario.belongsTo(Rol, { foreignKey: "id_rol" });

// Casa 1 -- 0..* Ingreso
Casa.hasMany(Ingreso, { foreignKey: "id_casa" });
Ingreso.belongsTo(Casa, { foreignKey: "id_casa" });

// Usuario (tesorera) 1 -- 0..* Ingreso
Usuario.hasMany(Ingreso, { foreignKey: "id_usuario_tesorera" });
Ingreso.belongsTo(Usuario, { foreignKey: "id_usuario_tesorera", as: "tesorera" });

// Usuario (tesorera) 1 -- 0..* Egreso
Usuario.hasMany(Egreso, { foreignKey: "id_usuario_tesorera" });
Egreso.belongsTo(Usuario, { foreignKey: "id_usuario_tesorera", as: "tesorera" });

// Usuario (residente) 1 -- 0..* Pase_QR
Usuario.hasMany(PaseQR, { foreignKey: "id_usuario_residente" });
PaseQR.belongsTo(Usuario, { foreignKey: "id_usuario_residente", as: "residente" });

// Pase_QR 1 -- 0..* registro_accesos
PaseQR.hasMany(RegistroAccesos, { foreignKey: "id_pase" });
RegistroAccesos.belongsTo(PaseQR, { foreignKey: "id_pase" });

// Usuario 1 -- 0..* Auditoria
Usuario.hasMany(Auditoria, { foreignKey: "id_usuario" });
Auditoria.belongsTo(Usuario, { foreignKey: "id_usuario" });

module.exports = {
    Casa,
    Rol,
    Usuario,
    Presupuesto,
    Ingreso,
    Egreso,
    PaseQR,
    RegistroAccesos,
    Auditoria
};