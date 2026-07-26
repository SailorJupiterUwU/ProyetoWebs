const router = require("express").Router();
const viviendaController = require("../controllers/vivienda.controller");

router.get("/", viviendaController.listar);
router.get("/:id", viviendaController.detalle);
router.post("/", viviendaController.crear);
router.put("/:id", viviendaController.editar);
router.patch("/:id/estado", viviendaController.cambiarEstado);

module.exports = router;
