const router = require("express").Router();
const rolController = require("../controllers/rol.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

// Endpoints de Gestión de Roles
router.get("/", autenticacion, autorizacion(["Presidenta"]), rolController.listar);
router.post("/", autenticacion, autorizacion(["Presidenta"]), rolController.crear);
router.put("/:id", autenticacion, autorizacion(["Presidenta"]), rolController.editar);
router.patch("/:id/estado", autenticacion, autorizacion(["Presidenta"]), rolController.cambiarEstado);
router.get("/:id/modulos", autenticacion, autorizacion(["Presidenta"]), rolController.obtenerModulos);
router.put("/:id/modulos", autenticacion, autorizacion(["Presidenta"]), rolController.actualizarModulos);

module.exports = router;
