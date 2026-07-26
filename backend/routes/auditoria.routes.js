const router = require("express").Router();
const auditoriaController = require("../controllers/auditoria.controller");

router.get("/", auditoriaController.listar);

module.exports = router;
