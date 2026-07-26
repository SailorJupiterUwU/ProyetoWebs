const router = require("express").Router();
const rubroController = require("../controllers/rubro.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), rubroController.listar);
router.post("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), rubroController.crear);
router.put("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera"]), rubroController.editar);

module.exports = router;
