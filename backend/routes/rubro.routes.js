const router = require("express").Router();
const rubroController = require("../controllers/rubro.controller");

router.get("/", rubroController.listar);
router.post("/", rubroController.crear);
router.put("/:id", rubroController.editar);

module.exports = router;
