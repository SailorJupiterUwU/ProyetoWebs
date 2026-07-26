const router = require("express").Router();
const autenticacionController = require("../controllers/autenticacion.controller");

// Endpoints de Autenticación
router.post("/login", autenticacionController.login);
router.post("/registro", autenticacionController.registro);
router.post("/recuperar-password", autenticacionController.recuperarPassword);
router.post("/reset-password", autenticacionController.resetPassword);
router.post("/logout", autenticacionController.logout);

module.exports = router;
