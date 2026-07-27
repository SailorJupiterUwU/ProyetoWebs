const { Op } = require("sequelize");
const Egreso = require("../models/egreso.model");
const Proveedor = require("../models/proveedor.model");
const Rubro = require("../models/rubro.model");
const Usuario = require("../models/usuario.model");
const Modulo = require("../models/modulo.model");
const { registrarAuditoria } = require("../utils/auditoria.util");

// ==========================================
// 1. LISTAR EGRESOS (GET /egresos)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const { fecha, num_factura, estado, monto_min, monto_max } = req.query;
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        let offset = (page - 1) * limit;

        let dondeEgreso = {};
        if (estado) {
            dondeEgreso.estado = estado;
        }
        if (num_factura) {
            dondeEgreso.num_factura = { [Op.like]: `%${num_factura}%` };
        }
        if (fecha) {
            dondeEgreso.fecha_comprobante = fecha;
        }
        if (monto_min && monto_max) {
            dondeEgreso.valor = { [Op.between]: [Number(monto_min), Number(monto_max)] };
        }

        const { rows: egresosBDD, count: totalCount } = await Egreso.findAndCountAll({
            where: dondeEgreso,
            include: [
                { model: Proveedor },
                { model: Rubro }
            ],
            limit: limit,
            offset: offset,
            order: [["fecha_comprobante", "DESC"]]
        });

        let data = [];
        for (let i = 0; i < egresosBDD.length; i++) {
            let e = egresosBDD[i];
            data.push({
                id_egreso: e.id_egreso,
                fecha_comprobante: e.fecha_comprobante,
                proveedor_nombre: e.proveedor ? e.proveedor.nombre : "N/A",
                rubro_nombre: e.rubro ? e.rubro.nombre : "N/A",
                valor: e.valor,
                num_factura: e.num_factura,
                debito_automatico: e.debito_automatico,
                estado: e.estado
            });
        }

        return res.status(200).json({
            data: data,
            total: totalCount,
            page: page,
            limit: limit
        });
    } catch (err) {
        console.error("Error en listar egresos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. DETALLE DE EGRESO (GET /egresos/:id)
// ==========================================
module.exports.detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const egreso = await Egreso.findByPk(id, {
            include: [{ model: Proveedor }, { model: Rubro }]
        });

        if (!egreso) {
            return res.status(404).json({ msg: "Egreso no encontrado" });
        }

        return res.status(200).json({
            id_egreso: egreso.id_egreso,
            proveedor: egreso.proveedor ? { id_proveedor: egreso.proveedor.id_proveedor, nombre: egreso.proveedor.nombre } : null,
            rubro: egreso.rubro ? { id_rubro: egreso.rubro.id_rubro, nombre: egreso.rubro.nombre } : null,
            num_factura: egreso.num_factura,
            fecha_comprobante: egreso.fecha_comprobante,
            valor: egreso.valor,
            num_cheque: egreso.num_cheque,
            debito_automatico: egreso.debito_automatico,
            estado: egreso.estado
        });
    } catch (err) {
        console.error("Error en detalle de egreso:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. CREAR EGRESO (POST /egresos)
// ==========================================
module.exports.crear = async (req, res) => {
    try {
        const { id_proveedor, id_rubro, num_factura, fecha_comprobante, valor, num_cheque, debito_automatico } = req.body;

        if (!id_proveedor || !id_rubro || !num_factura || !fecha_comprobante || valor === undefined) {
            return res.status(400).json({ msg: "Proveedor, rubro, factura, fecha y valor son requeridos" });
        }

        // Validar si el proveedor tiene facturas pendientes vencidas
        const hoy = new Date();
        const egresoVencido = await Egreso.findOne({
            where: {
                id_proveedor: Number(id_proveedor),
                estado: "PENDIENTE",
                fecha_comprobante: { [Op.lt]: hoy }
            }
        });

        if (egresoVencido) {
            return res.status(409).json({ msg: "Este proveedor tiene una factura vencida sin pagar. No se puede registrar una nueva." });
        }

        const idUsuarioRegistra = req.usuario ? req.usuario.id_usuario : 1;

        const nuevoEgreso = await Egreso.create({
            id_proveedor: Number(id_proveedor),
            id_rubro: Number(id_rubro),
            id_usuario: idUsuarioRegistra,
            num_factura: num_factura,
            fecha_comprobante: fecha_comprobante,
            valor: Number(valor),
            num_cheque: num_cheque || null,
            debito_automatico: debito_automatico || false,
            estado: "PENDIENTE"
        });

        const modulo = await Modulo.findOne({ where: { nombre: "Egresos" } });
        await registrarAuditoria(idUsuarioRegistra, modulo?.id_modulo, "Egreso registrado", req.ip, `Egreso #${nuevoEgreso.id_egreso} | Factura: ${num_factura} | Valor: $${valor}`);

        return res.status(201).json({
            id_egreso: nuevoEgreso.id_egreso,
            msg: "Egreso registrado"
        });
    } catch (err) {
        console.error("Error en crear egreso:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 4. EDITAR EGRESO (PUT /egresos/:id)
// ==========================================
module.exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { valor, estado, num_cheque } = req.body;

        const egreso = await Egreso.findByPk(id);
        if (!egreso) {
            return res.status(404).json({ msg: "Egreso no encontrado" });
        }

        if (valor !== undefined) egreso.valor = Number(valor);
        if (estado !== undefined) egreso.estado = estado;
        if (num_cheque !== undefined) egreso.num_cheque = num_cheque;

        await egreso.save();

        const modulo = await Modulo.findOne({ where: { nombre: "Egresos" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, `Egreso #${id} actualizado`, req.ip, estado ? `Nuevo estado: ${estado}` : null);

        return res.status(200).json({ msg: "Egreso actualizado" });
    } catch (err) {
        console.error("Error en editar egreso:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 5. RESUMEN DE EGRESOS (GET /egresos/resumen)
// ==========================================
module.exports.resumen = async (req, res) => {
    try {
        const egresosDelMesSum = await Egreso.sum("valor", { where: { estado: "PAGADO" } });
        const pagosPendientesSum = await Egreso.sum("valor", { where: { estado: "PENDIENTE" } });
        const facturasPorVencerCount = await Egreso.count({ where: { estado: "PENDIENTE" } });

        return res.status(200).json({
            egresos_del_mes: Number(egresosDelMesSum) || 0,
            variacion_pct: 12,
            pagos_pendientes: Number(pagosPendientesSum) || 0,
            facturas_por_vencer: facturasPorVencerCount,
            presupuesto_restante: 4300.00
        });
    } catch (err) {
        console.error("Error en resumen de egresos:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
