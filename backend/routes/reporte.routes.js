const router = require("express").Router();
const reporteController = require("../controllers/reporte.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), reporteController.listar);
router.post("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), reporteController.generar);
router.get("/:id/descargar", autenticacion, autorizacion(["Presidenta", "Tesorera"]), reporteController.descargar);

module.exports = router;
