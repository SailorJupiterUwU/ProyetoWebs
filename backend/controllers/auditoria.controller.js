const Auditoria = require("../models/auditoria.model");
const Usuario = require("../models/usuario.model");
const Persona = require("../models/persona.model");
const Rol = require("../models/rol.model");
const Modulo = require("../models/modulo.model");

// ==========================================
// 1. LISTAR REGISTROS DE AUDITORÍA (GET /auditoria)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const auditoriasBDD = await Auditoria.findAll({
            include: [
                {
                    model: Usuario,
                    include: [{ model: Persona }, { model: Rol }]
                },
                { model: Modulo }
            ],
            order: [["fecha", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < auditoriasBDD.length; i++) {
            let a = auditoriasBDD[i];
            let nombreUsuario = "Sistema";
            let nombreRol = "N/A";

            if (a.usuario) {
                if (a.usuario.persona) {
                    nombreUsuario = `${a.usuario.persona.nombres} ${a.usuario.persona.apellidos}`;
                }
                if (a.usuario.rol) {
                    nombreRol = a.usuario.rol.nombre;
                }
            }

            data.push({
                fecha: a.fecha,
                usuario_nombre: nombreUsuario,
                rol_nombre: nombreRol,
                modulo_nombre: a.modulo ? a.modulo.nombre : "General",
                accion: a.accion
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar auditoría:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
