const router = require("express").Router();
const uploadMiddleware = require("../middlewares/upload.middleware");
const ingresoController = require("../controllers/ingreso.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/mis-pagos", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente"]), ingresoController.listarPropios);
router.get("/resumen", autenticacion, autorizacion(["Presidenta", "Tesorera"]), ingresoController.resumen);
router.get("/distribucion", autenticacion, autorizacion(["Presidenta", "Tesorera"]), ingresoController.distribucion);
router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), ingresoController.listar);
router.get("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente"]), ingresoController.detalle);
router.post("/", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente"]), uploadMiddleware.single("comprobante"), ingresoController.crear);

module.exports = router;
