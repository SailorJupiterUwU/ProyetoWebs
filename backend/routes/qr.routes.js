const router = require("express").Router();
const qrController = require("../controllers/qr.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.post("/validar", autenticacion, autorizacion(["Guardia", "Presidenta"]), qrController.validar);
router.patch("/:id/ingreso", autenticacion, autorizacion(["Guardia", "Presidenta"]), qrController.registrarIngreso);
router.patch("/:id/salida", autenticacion, autorizacion(["Guardia", "Presidenta"]), qrController.registrarSalida);
router.patch("/:id/revocar", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente", "Guardia"]), qrController.revocar);

module.exports = router;
