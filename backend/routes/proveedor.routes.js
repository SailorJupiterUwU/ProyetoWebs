const router = require("express").Router();
const proveedorController = require("../controllers/proveedor.controller");

router.get("/", proveedorController.listar);
router.post("/", proveedorController.crear);
router.put("/:id", proveedorController.editar);

module.exports = router;
