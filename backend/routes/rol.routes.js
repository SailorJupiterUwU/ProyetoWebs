const router = require("express").Router();
const rolController = require("../controllers/rol.controller");

// Endpoints de Gestión de Roles
router.get("/", rolController.listar);
router.post("/", rolController.crear);
router.put("/:id", rolController.editar);
router.patch("/:id/estado", rolController.cambiarEstado);
router.get("/:id/modulos", rolController.obtenerModulos);
router.put("/:id/modulos", rolController.actualizarModulos);

module.exports = router;
