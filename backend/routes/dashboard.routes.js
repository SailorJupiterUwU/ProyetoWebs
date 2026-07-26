const router = require("express").Router();
const dashboardController = require("../controllers/dashboard.controller");

router.get("/resumen", dashboardController.resumen);
router.get("/ingresos-vs-egresos", dashboardController.ingresosVsEgresos);
router.get("/cartera", dashboardController.cartera);
router.get("/movimientos-recientes", dashboardController.movimientosRecientes);

module.exports = router;
