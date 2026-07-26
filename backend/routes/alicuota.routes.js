const router = require("express").Router();
const alicuotaController = require("../controllers/alicuota.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/mis-alicuotas", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente"]), alicuotaController.listarPropias);
router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), alicuotaController.listar);
router.get("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente"]), alicuotaController.detalle);

module.exports = router;
