const router = require("express").Router();
const historialController = require("../controllers/historial.controller");

router.get("/", historialController.listar);

module.exports = router;
