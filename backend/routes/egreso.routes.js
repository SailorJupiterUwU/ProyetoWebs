const router = require("express").Router();
const egresoController = require("../controllers/egreso.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/resumen", autenticacion, autorizacion(["Presidenta", "Tesorera"]), egresoController.resumen);
router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), egresoController.listar);
router.get("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera"]), egresoController.detalle);
router.post("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), egresoController.crear);
router.put("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera"]), egresoController.editar);

module.exports = router;
