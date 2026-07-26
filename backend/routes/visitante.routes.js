const router = require("express").Router();
const visitanteController = require("../controllers/visitante.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera", "Guardia"]), visitanteController.listar);
router.get("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera", "Guardia", "Residente"]), visitanteController.detalle);
router.post("/", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente", "Guardia"]), visitanteController.crear);

module.exports = router;
