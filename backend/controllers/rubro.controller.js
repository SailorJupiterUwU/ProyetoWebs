const Rubro = require("../models/rubro.model");

// ==========================================
// 1. LISTAR RUBROS (GET /rubros)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const rubrosBDD = await Rubro.findAll();

        let listaRubros = [];
        for (let i = 0; i < rubrosBDD.length; i++) {
            let r = rubrosBDD[i];
            listaRubros.push({
                id_rubro: r.id_rubro,
                codigo: r.codigo,
                nombre: r.nombre,
                tipo: r.tipo,
                estado: r.estado
            });
        }

        return res.status(200).json({ data: listaRubros });
    } catch (err) {
        console.error("Error en listar rubros:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. CREAR RUBRO (POST /rubros)
// ==========================================
module.exports.crear = async (req, res) => {
    try {
        const { codigo, nombre, tipo } = req.body;

        if (!codigo || !nombre || !tipo) {
            return res.status(400).json({ msg: "Código, nombre y tipo son obligatorios" });
        }

        const nuevoRubro = await Rubro.create({
            codigo: codigo,
            nombre: nombre,
            tipo: tipo,
            estado: true
        });

        return res.status(201).json({
            id_rubro: nuevoRubro.id_rubro,
            msg: "Rubro creado"
        });
    } catch (err) {
        console.error("Error en crear rubro:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. EDITAR RUBRO (PUT /rubros/:id)
// ==========================================
module.exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, estado } = req.body;

        const rubro = await Rubro.findByPk(id);
        if (!rubro) {
            return res.status(404).json({ msg: "Rubro no encontrado" });
        }

        if (nombre !== undefined) {
            rubro.nombre = nombre;
        }
        if (estado !== undefined) {
            rubro.estado = estado;
        }

        await rubro.save();

        return res.status(200).json({ msg: "Rubro actualizado" });
    } catch (err) {
        console.error("Error en editar rubro:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
