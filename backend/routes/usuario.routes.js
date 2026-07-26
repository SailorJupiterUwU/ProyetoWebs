const router = require("express").Router();
const usuarioController = require("../controllers/usuario.controller");

// 1. Solicitudes de Registro (Deben ir antes de /:id para no generar conflictos)
router.get("/solicitudes", usuarioController.listarSolicitudes);
router.get("/solicitudes/historial", usuarioController.historialSolicitudes);
router.patch("/solicitudes/:id/aprobar", usuarioController.aprobarSolicitud);
router.patch("/solicitudes/:id/rechazar", usuarioController.rechazarSolicitud);

// 2. Operaciones CRUD de Usuarios
router.get("/", usuarioController.listar);
router.get("/:id", usuarioController.detalle);
router.post("/", usuarioController.crear);
router.put("/:id", usuarioController.editar);
router.patch("/:id/estado", usuarioController.cambiarEstado);
router.get("/:id/historial", usuarioController.historialOperaciones);

module.exports = router;
