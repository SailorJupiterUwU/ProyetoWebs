const router = require("express").Router();
const viviendaController = require("../controllers/vivienda.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), viviendaController.listar);
router.get("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera"]), viviendaController.detalle);
router.post("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), viviendaController.crear);
router.put("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera"]), viviendaController.editar);
router.patch("/:id/estado", autenticacion, autorizacion(["Presidenta", "Tesorera"]), viviendaController.cambiarEstado);

module.exports = router;
