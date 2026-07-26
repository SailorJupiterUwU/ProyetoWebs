const router = require("express").Router();
const auditoriaController = require("../controllers/auditoria.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), auditoriaController.listar);

module.exports = router;
