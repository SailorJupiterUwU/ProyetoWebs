const router = require("express").Router();
const multaController = require("../controllers/multa.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/mis-multas", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente"]), multaController.listarPropias);
router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), multaController.listar);
router.get("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente"]), multaController.detalle);

module.exports = router;
