const Vivienda = require("../models/vivienda.model");

// ==========================================
// 1. LISTAR VIVIENDAS (GET /viviendas)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const viviendasBDD = await Vivienda.findAll();

        let listaViviendas = [];
        for (let i = 0; i < viviendasBDD.length; i++) {
            let v = viviendasBDD[i];
            listaViviendas.push({
                id_vivienda: v.id_vivienda,
                numero: v.numero,
                porcentaje_alicuota: v.porcentaje_alicuota,
                estado: v.estado
            });
        }

        return res.status(200).json({ data: listaViviendas });
    } catch (err) {
        console.error("Error en listar viviendas:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. DETALLE DE VIVENDA (GET /viviendas/:id)
// ==========================================
module.exports.detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const vivienda = await Vivienda.findByPk(id);
        if (!vivienda) {
            return res.status(404).json({ msg: "Vivienda no encontrada" });
        }

        return res.status(200).json({
            id_vivienda: vivienda.id_vivienda,
            numero: vivienda.numero,
            porcentaje_alicuota: vivienda.porcentaje_alicuota,
            estado: vivienda.estado
        });
    } catch (err) {
        console.error("Error en detalle de vivienda:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. CREAR VIVENDA (POST /viviendas)
// ==========================================
module.exports.crear = async (req, res) => {
    try {
        const { numero, porcentaje_alicuota } = req.body;

        if (!numero || !porcentaje_alicuota) {
            return res.status(400).json({ msg: "El número y porcentaje de alícuota son requeridos" });
        }

        // Validar que la suma total de alícuotas no supere 1.00 (100%)
        const totalAlicuota = await Vivienda.sum("porcentaje_alicuota");

        const totalConNueva = (Number(totalAlicuota)) + Number(porcentaje_alicuota);

        if (totalConNueva > 1.0) {
            return res.status(400).json({ msg: "La suma de porcentajes de alícuota supera el 100%" });
        }

        const nuevaVivienda = await Vivienda.create({
            numero: numero,
            porcentaje_alicuota: porcentaje_alicuota,
            estado: true
        });

        return res.status(201).json({
            id_vivienda: nuevaVivienda.id_vivienda,
            msg: "Vivienda creada"
        });
    } catch (err) {
        console.error("Error en crear vivienda:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 4. EDITAR VIVENDA (PUT /viviendas/:id)
// ==========================================
module.exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero, porcentaje_alicuota } = req.body;

        const vivienda = await Vivienda.findByPk(id);
        if (!vivienda) {
            return res.status(404).json({ msg: "Vivienda no encontrada" });
        }

        if (numero !== undefined) {
            vivienda.numero = numero;
        }

        if (porcentaje_alicuota !== undefined) {

            const sumaActual = await Vivienda.sum("porcentaje_alicuota");
            const totalModificado = (Number(sumaActual)) - Number(vivienda.porcentaje_alicuota) + Number(porcentaje_alicuota);

            if (totalModificado > 1.0) {
                return res.status(400).json({ msg: "La suma de porcentajes de alícuota supera el 100%" });
            }

            vivienda.porcentaje_alicuota = porcentaje_alicuota;
        }

        await vivienda.save();

        return res.status(200).json({ msg: "Vivienda actualizada" });
    } catch (err) {
        console.error("Error en editar vivienda:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 5. CAMBIAR ESTADO DE VIVENDA (PATCH /viviendas/:id/estado)
// ==========================================
module.exports.cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const vivienda = await Vivienda.findByPk(id);
        if (!vivienda) {
            return res.status(404).json({ msg: "Vivienda no encontrada" });
        }

        vivienda.estado = estado;
        await vivienda.save();

        return res.status(200).json({ msg: "Estado actualizado" });
    } catch (err) {
        console.error("Error en cambiar estado de vivienda:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
