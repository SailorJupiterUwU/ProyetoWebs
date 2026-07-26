const Proveedor = require("../models/proveedor.model");

// ==========================================
// 1. LISTAR PROVEEDORES (GET /proveedores)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const proveedoresBDD = await Proveedor.findAll();

        let data = [];
        for (let i = 0; i < proveedoresBDD.length; i++) {
            let p = proveedoresBDD[i];
            data.push({
                id_proveedor: p.id_proveedor,
                nombre: p.nombre,
                estado: p.estado
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar proveedores:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. CREAR PROVEEDOR (POST /proveedores)
// ==========================================
module.exports.crear = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ msg: "El nombre del proveedor es obligatorio" });
        }

        const nuevoProveedor = await Proveedor.create({
            nombre: nombre,
            estado: true
        });

        return res.status(201).json({
            id_proveedor: nuevoProveedor.id_proveedor,
            msg: "Proveedor creado"
        });
    } catch (err) {
        console.error("Error en crear proveedor:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. EDITAR PROVEEDOR (PUT /proveedores/:id)
// ==========================================
module.exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, estado } = req.body;

        const proveedor = await Proveedor.findByPk(id);
        if (!proveedor) {
            return res.status(404).json({ msg: "Proveedor no encontrado" });
        }

        if (nombre !== undefined) {
            proveedor.nombre = nombre;
        }
        if (estado !== undefined) {
            proveedor.estado = estado;
        }

        await proveedor.save();

        return res.status(200).json({ msg: "Proveedor actualizado" });
    } catch (err) {
        console.error("Error en editar proveedor:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
