const router = require("express").Router();
const autenticacionController = require("../controllers/autenticacion.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware")
// Endpoints de Autenticación
router.post("/login", autenticacionController.login);
router.post("/registro", autenticacionController.registro);
router.post("/recuperar-password", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente", "Guardia"]), autenticacionController.recuperarPassword);
router.post("/reset-password", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente", "Guardia"]),autenticacionController.resetPassword);
router.post("/logout", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente", "Guardia"]), autenticacionController.logout);

module.exports = router;
