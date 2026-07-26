const router = require("express").Router();
const visitanteController = require("../controllers/visitante.controller");

router.get("/", visitanteController.listar);
router.get("/:id", visitanteController.detalle);
router.post("/", visitanteController.crear);

module.exports = router;
