const router = require("express").Router();
const uploadMiddleware = require("../middlewares/upload.middleware");
const ingresoController = require("../controllers/ingreso.controller");

router.get("/mis-pagos", ingresoController.listarPropios);
router.get("/resumen", ingresoController.resumen);
router.get("/distribucion", ingresoController.distribucion);
router.get("/", ingresoController.listar);
router.get("/:id", ingresoController.detalle);
router.post("/", uploadMiddleware.single("comprobante"), ingresoController.crear);

module.exports = router;
