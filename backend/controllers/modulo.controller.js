const Modulo = require("../models/modulo.model");

// ==========================================
// 1. LISTAR MÓDULOS (GET /modulos)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const modulosBDD = await Modulo.findAll();

        let listaModulos = [];
        for (let i = 0; i < modulosBDD.length; i++) {
            let m = modulosBDD[i];
            listaModulos.push({
                id_modulo: m.id_modulo,
                nombre: m.nombre
            });
        }

        return res.status(200).json({ data: listaModulos });
    } catch (err) {
        console.error("Error en listar módulos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
