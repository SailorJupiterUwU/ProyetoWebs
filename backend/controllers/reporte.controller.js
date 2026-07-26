const ReporteFinanciero = require("../models/reporteFinanciero.model");
const Usuario = require("../models/usuario.model");
const Persona = require("../models/persona.model");

// ==========================================
// 1. LISTAR REPORTES (GET /reportes)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const reportesBDD = await ReporteFinanciero.findAll({
            include: [
                {
                    model: Usuario,
                    include: [{ model: Persona }]
                }
            ],
            order: [["fecha_generacion", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < reportesBDD.length; i++) {
            let r = reportesBDD[i];
            let nombreGeneradoPor = "Administrador";
            if (r.usuario && r.usuario.persona) {
                nombreGeneradoPor = `${r.usuario.persona.nombres} ${r.usuario.persona.apellidos}`;
            }

            data.push({
                id_reporte: r.id_reporte,
                tipo: r.tipo,
                fecha_inicio: r.fecha_inicio,
                fecha_fin: r.fecha_fin,
                fecha_generacion: r.fecha_generacion,
                generado_por: nombreGeneradoPor
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar reportes:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. GENERAR REPORTE (POST /reportes)
// ==========================================
module.exports.generar = async (req, res) => {
    try {
        const { tipo, fecha_inicio, fecha_fin } = req.body;

        if (!tipo || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ msg: "El tipo, fecha de inicio y fecha de fin son requeridos" });
        }

        const idUsuario = req.usuario ? req.usuario.id_usuario : 1;
        const nombreArchivo = `reporte_${Date.now()}.pdf`;

        const nuevoReporte = await ReporteFinanciero.create({
            id_usuario: idUsuario,
            tipo: tipo,
            fecha_inicio: fecha_inicio,
            fecha_fin: fecha_fin,
            fecha_generacion: new Date(),
            archivo_pdf: nombreArchivo
        });

        return res.status(201).json({
            id_reporte: nuevoReporte.id_reporte,
            archivo_pdf: nombreArchivo,
            msg: "Reporte generado"
        });
    } catch (err) {
        console.error("Error en generar reporte:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. DESCARGAR REPORTE (GET /reportes/:id/descargar)
// ==========================================
module.exports.descargar = async (req, res) => {
    try {
        const { id } = req.params;

        const reporte = await ReporteFinanciero.findByPk(id);
        if (!reporte) {
            return res.status(404).json({ msg: "Reporte no encontrado" });
        }

        // Si existe el archivo en el sistema de archivos se envía, si no se envía un PDF o confirmación
        return res.status(200).json({
            msg: "Descarga de reporte",
            archivo: reporte.archivo_pdf
        });
    } catch (err) {
        console.error("Error en descargar reporte:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
