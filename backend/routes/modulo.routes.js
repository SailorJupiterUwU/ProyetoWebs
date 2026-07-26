const router = require("express").Router();
const moduloController = require("../controllers/modulo.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/", autenticacion, autorizacion(["Presidenta"]), moduloController.listar);

module.exports = router;
