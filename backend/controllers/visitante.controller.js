const Visitante = require("../models/visitante.model");
const CodigoQR = require("../models/codigoQr.model");
const Vivienda = require("../models/vivienda.model");

// ==========================================
// 1. CREAR VISITANTE / PASE (POST /visitantes)
// ==========================================
module.exports.crear = async (req, res) => {
    try {
        const { nombre, apellido, cedula, num_personas, tiene_vehiculo, placa, id_vivienda_destino, valido_desde, valido_hasta } = req.body;

        if (!nombre || !apellido || !cedula || !id_vivienda_destino) {
            return res.status(400).json({ msg: "Nombre, apellido, cédula y vivienda destino son obligatorios" });
        }

        if (tiene_vehiculo && !placa) {
            return res.status(400).json({ msg: "Debe indicar la placa si el visitante tiene vehículo" });
        }

        const nuevoVisitante = await Visitante.create({
            id_vivienda_destino: Number(id_vivienda_destino),
            nombre: nombre,
            apellido: apellido,
            cedula: cedula,
            num_personas: Number(num_personas) || 1,
            tiene_vehiculo: tiene_vehiculo || false,
            placa: placa || null,
            estado: true
        });

        // Generar un código QR aleatorio de prueba
        const codigoQrGenerado = `QR-${Date.now()}-${nuevoVisitante.id_visitante}`;
        const idUsuario = req.usuario ? req.usuario.id_usuario : 1;

        await CodigoQR.create({
            id_usuario: idUsuario,
            id_visitante: nuevoVisitante.id_visitante,
            codigo: codigoQrGenerado,
            valido_desde: valido_desde ? new Date(valido_desde) : new Date(),
            valido_hasta: valido_hasta ? new Date(valido_hasta) : new Date(Date.now() + 24 * 60 * 60 * 1000),
            fecha_generacion: new Date(),
            estado: "PENDIENTE"
        });

        return res.status(201).json({
            id_visitante: nuevoVisitante.id_visitante,
            codigo_qr: codigoQrGenerado,
            msg: "Pase generado"
        });
    } catch (err) {
        console.error("Error en crear visitante:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. LISTAR VISITANTES (GET /visitantes)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const visitantesBDD = await Visitante.findAll({
            include: [
                { model: Vivienda, as: "viviendaDestino" },
                { model: CodigoQR }
            ],
            order: [["id_visitante", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < visitantesBDD.length; i++) {
            let v = visitantesBDD[i];
            data.push({
                id_visitante: v.id_visitante,
                nombre: v.nombre,
                apellido: v.apellido,
                numero_vivienda: v.viviendaDestino ? v.viviendaDestino.numero : "N/A", // antes: v.vivienda
                valido_desde: v.codigo_qr ? v.codigo_qr.valido_desde : null,
                valido_hasta: v.codigo_qr ? v.codigo_qr.valido_hasta : null,
                estado_qr: v.codigo_qr ? v.codigo_qr.estado : "PENDIENTE"
            });
        }

        return res.status(200).json({ data: data });
    } catch (err) {
        console.error("Error en listar visitantes:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. DETALLE DE VISITANTE (GET /visitantes/:id)
// ==========================================
module.exports.detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const visitante = await Visitante.findByPk(id, {
            include: [{ model: Vivienda, as: "viviendaDestino" }, { model: CodigoQR }]
        });

        if (!visitante) {
            return res.status(404).json({ msg: "Visitante no encontrado" });
        }

        return res.status(200).json({
            id_visitante: visitante.id_visitante,
            nombre: visitante.nombre,
            apellido: visitante.apellido,
            cedula: visitante.cedula,
            num_personas: visitante.num_personas,
            tiene_vehiculo: visitante.tiene_vehiculo,
            placa: visitante.placa,
            vivienda_destino: visitante.viviendaDestino ? visitante.viviendaDestino.numero : "N/A", // antes: visitante.vivienda
            qr: visitante.codigo_qr
        });
    } catch (err) {
        console.error("Error en detalle de visitante:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
