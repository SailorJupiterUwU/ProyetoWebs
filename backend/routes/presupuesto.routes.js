const router = require("express").Router();
const uploadMiddleware = require("../middlewares/upload.middleware");
const presupuestoController = require("../controllers/presupuesto.controller");

router.get("/", presupuestoController.listar);
router.get("/:id", presupuestoController.detalle);
router.post("/importar", uploadMiddleware.single("archivo"), presupuestoController.importarExcel);
router.get("/:id/rubros", presupuestoController.listarRubros);
router.post("/:id/rubros", presupuestoController.agregarRubro);
router.put("/:id/rubros/:idRubro", presupuestoController.editarMontoRubro);

module.exports = router;
