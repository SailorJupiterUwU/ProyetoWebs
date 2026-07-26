const router = require("express").Router();
const uploadMiddleware = require("../middlewares/upload.middleware");
const presupuestoController = require("../controllers/presupuesto.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), presupuestoController.listar);
router.get("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera"]), presupuestoController.detalle);
router.post("/importar", autenticacion, autorizacion(["Presidenta", "Tesorera"]), uploadMiddleware.single("archivo"), presupuestoController.importarExcel);
router.get("/:id/rubros", autenticacion, autorizacion(["Presidenta", "Tesorera"]), presupuestoController.listarRubros);
router.post("/:id/rubros", autenticacion, autorizacion(["Presidenta", "Tesorera"]), presupuestoController.agregarRubro);
router.put("/:id/rubros/:idRubro", autenticacion, autorizacion(["Presidenta", "Tesorera"]), presupuestoController.editarMontoRubro);

module.exports = router;
