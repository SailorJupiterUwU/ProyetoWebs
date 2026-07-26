const router = require("express").Router();
const qrController = require("../controllers/qr.controller");

router.post("/validar", qrController.validar);
router.patch("/:id/ingreso", qrController.registrarIngreso);
router.patch("/:id/salida", qrController.registrarSalida);
router.patch("/:id/revocar", qrController.revocar);

module.exports = router;
