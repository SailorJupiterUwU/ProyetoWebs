const { Op } = require("sequelize");
const Auditoria = require("../models/auditoria.model");
const Usuario = require("../models/usuario.model");
const Persona = require("../models/persona.model");
const Rol = require("../models/rol.model");
const Modulo = require("../models/modulo.model");

// ==========================================
// 1. LISTAR REGISTROS DE AUDITORÍA (GET /auditoria)
//    Soporta filtros opcionales: fecha_inicio, fecha_fin, id_rol, id_usuario
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, id_rol, id_usuario } = req.query;

        // --- Filtro por rango de fechas ---
        const whereFecha = {};
        if (fecha_inicio && fecha_fin) {
            // Incluir todo el día de fecha_fin agregándole 23:59:59
            whereFecha.fecha = { [Op.between]: [new Date(fecha_inicio), new Date(`${fecha_fin}T23:59:59`)] };
        } else if (fecha_inicio) {
            whereFecha.fecha = { [Op.gte]: new Date(fecha_inicio) };
        } else if (fecha_fin) {
            whereFecha.fecha = { [Op.lte]: new Date(`${fecha_fin}T23:59:59`) };
        }

        // --- Filtro por usuario específico ---
        if (id_usuario) {
            whereFecha.id_usuario = id_usuario;
        }

        // --- Filtro por rol (se aplica sobre el modelo Usuario incluido) ---
        const whereUsuario = {};
        if (id_rol) {
            whereUsuario.id_rol = id_rol;
        }

        const auditoriasBDD = await Auditoria.findAll({
            where: whereFecha,
            include: [
                {
                    model: Usuario,
                    where: Object.keys(whereUsuario).length ? whereUsuario : undefined,
                    include: [{ model: Persona }, { model: Rol }]
                },
                { model: Modulo }
            ],
            order: [["fecha", "DESC"]]
        });

        // Dar forma a los datos para que el frontend pueda consumirlos directamente
        const data = auditoriasBDD.map((a) => ({
            fecha:         a.fecha,
            usuario_nombre: a.usuario?.persona
                ? `${a.usuario.persona.nombres} ${a.usuario.persona.apellidos}`
                : "Sistema",
            rol_nombre:    a.usuario?.rol?.nombre ?? "N/A",
            modulo_nombre: a.modulo?.nombre ?? "General",
            accion:        a.accion,
        }));

        return res.status(200).json({ data });
    } catch (err) {
        console.error("Error en listar auditoría:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

