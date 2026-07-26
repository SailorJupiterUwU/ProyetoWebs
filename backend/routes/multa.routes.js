const router = require("express").Router();
const multaController = require("../controllers/multa.controller");

router.get("/mis-multas", multaController.listarPropias);
router.get("/", multaController.listar);
router.get("/:id", multaController.detalle);

module.exports = router;
