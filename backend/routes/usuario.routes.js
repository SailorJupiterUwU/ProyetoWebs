const router = require("express").Router();
const usuarioController = require("../controllers/usuario.controller");
const { autenticacion, autorizacion } = require("../middlewares/auth.middleware");

// 1. Solicitudes de Registro (Deben ir antes de /:id para no generar conflictos)
router.get("/solicitudes", autenticacion, autorizacion(["Presidenta"]), usuarioController.listarSolicitudes);
router.get("/solicitudes/historial", autenticacion, autorizacion(["Presidenta"]), usuarioController.historialSolicitudes);
router.patch("/solicitudes/:id/aprobar", autenticacion, autorizacion(["Presidenta"]), usuarioController.aprobarSolicitud);
router.patch("/solicitudes/:id/rechazar", autenticacion, autorizacion(["Presidenta"]), usuarioController.rechazarSolicitud);

// 2. Operaciones CRUD de Usuarios
router.get("/", autenticacion, autorizacion(["Presidenta", "Tesorera"]), usuarioController.listar);
router.get("/:id", autenticacion, autorizacion(["Presidenta", "Tesorera", "Residente"]), usuarioController.detalle);
router.post("/", autenticacion, autorizacion(["Presidenta"]), usuarioController.crear);
router.put("/:id", autenticacion, autorizacion(["Presidenta"]), usuarioController.editar);
router.patch("/:id/estado", autenticacion, autorizacion(["Presidenta"]), usuarioController.cambiarEstado);
router.get("/:id/historial", autenticacion, autorizacion(["Presidenta"]), usuarioController.historialOperaciones);

module.exports = router;
