const router = require("express").Router();
const reporteController = require("../controllers/reporte.controller");

router.get("/", reporteController.listar);
router.post("/", reporteController.generar);
router.get("/:id/descargar", reporteController.descargar);

module.exports = router;
