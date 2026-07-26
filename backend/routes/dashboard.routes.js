const router = require("express").Router();
const dashboardController = require("../controllers/dashboard.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/resumen", autenticacion, autorizacion(["Presidenta", "Tesorera"]), dashboardController.resumen);
router.get("/ingresos-vs-egresos", autenticacion, autorizacion(["Presidenta", "Tesorera"]), dashboardController.ingresosVsEgresos);
router.get("/cartera", autenticacion, autorizacion(["Presidenta", "Tesorera"]), dashboardController.cartera);
router.get("/movimientos-recientes", autenticacion, autorizacion(["Presidenta", "Tesorera"]), dashboardController.movimientosRecientes);

module.exports = router;
