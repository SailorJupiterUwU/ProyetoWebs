const router = require("express").Router();
const moduloController = require("../controllers/modulo.controller");

router.get("/", moduloController.listar);

module.exports = router;
