const router = require("express").Router();
const alicuotaController = require("../controllers/alicuota.controller");

router.get("/mis-alicuotas", alicuotaController.listarPropias);
router.get("/", alicuotaController.listar);
router.get("/:id", alicuotaController.detalle);

module.exports = router;
