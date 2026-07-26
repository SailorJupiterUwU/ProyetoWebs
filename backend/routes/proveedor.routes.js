const router = require("express").Router();
const proveedorController = require("../controllers/proveedor.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), proveedorController.listar);
router.post("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), proveedorController.crear);
router.put("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera"]), proveedorController.editar);

module.exports = router;
