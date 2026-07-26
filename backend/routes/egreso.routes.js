const router = require("express").Router();
const egresoController = require("../controllers/egreso.controller");

router.get("/resumen", egresoController.resumen);
router.get("/", egresoController.listar);
router.get("/:id", egresoController.detalle);
router.post("/", egresoController.crear);
router.put("/:id", egresoController.editar);

module.exports = router;
