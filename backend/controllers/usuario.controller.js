const { Op } = require("sequelize");
const Usuario = require("../models/usuario.model");
const Persona = require("../models/persona.model");
const Rol = require("../models/rol.model");
const Modulo = require("../models/modulo.model");
const Vivienda = require("../models/vivienda.model");
const Ingreso = require("../models/ingreso.model");
const Egreso = require("../models/egreso.model");
const bcrypt = require("bcryptjs");
const { registrarAuditoria } = require("../utils/auditoria.util");

// ==========================================
// 1. LISTAR USUARIOS (GET /usuarios)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const { search, estado } = req.query;

        // Construir filtro de estado para la tabla Usuario
        let filtroUsuario = {};
        if (estado === "activos") {
            filtroUsuario.estado = "ACTIVO";
        } else if (estado === "inactivos") {
            filtroUsuario.estado = "INACTIVO";
        }
 
        // Construir filtro de búsqueda por texto para la tabla Persona
        let filtroPersona = {};
        if (search && search.trim() !== "") {
            filtroPersona[Op.or] = [
                { nombres: { [Op.like]: `%${search}%` } },
                { apellidos: { [Op.like]: `%${search}%` } },
                { ci_ruc: { [Op.like]: `%${search}%` } }
            ];
        }

        const usuariosBDD = await Usuario.findAll({
            where: filtroUsuario,
            include: [
                { model: Persona, where: filtroPersona, required: Object.keys(filtroPersona).length > 0 },
                { model: Rol },
                { model: Vivienda }
            ]
        });

        let ListaUsuarios = [];
        for (let i = 0; i < usuariosBDD.length; i++) {
            let u = usuariosBDD[i];
            ListaUsuarios.push({
                id_usuario: u.id_usuario,
                nombres: u.persona ? u.persona.nombres : "",
                apellidos: u.persona ? u.persona.apellidos : "",
                ci_ruc: u.persona ? u.persona.ci_ruc : "",
                rol_nombre: u.rol ? u.rol.nombre : "",
                estado: u.estado,
                numero_vivienda: u.vivienda ? u.vivienda.numero : "Sin Asignar"
            });
        }

        return res.status(200).json({
            data: ListaUsuarios,
            total: ListaUsuarios.length
        });
    } catch (err) {
        console.error("Error en listar usuarios:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. DETALLE DE USUARIO (GET /usuarios/:id)
// ==========================================
module.exports.detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            include: [
                { model: Persona },
                { model: Rol },
                { model: Vivienda }
            ]
        });

        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        return res.status(200).json({
            id_usuario: usuario.id_usuario,
            id_persona: usuario.persona ? usuario.persona.id_persona : null,
            nombres: usuario.persona ? usuario.persona.nombres : "",
            apellidos: usuario.persona ? usuario.persona.apellidos : "",
            ci_ruc: usuario.persona ? usuario.persona.ci_ruc : "",
            correo: usuario.persona ? usuario.persona.correo : usuario.correo_login,
            telefono: usuario.persona ? usuario.persona.telefono : null,
            foto: usuario.persona ? usuario.persona.foto : null,
            rol: usuario.rol ? { id_rol: usuario.rol.id_rol, nombre: usuario.rol.nombre } : null,
            vivienda: usuario.vivienda ? { id_vivienda: usuario.vivienda.id_vivienda, numero: usuario.vivienda.numero } : null,
            estado: usuario.estado,
            fecha_registro: usuario.fecha_registro
        });
    } catch (err) {
        console.error("Error en detalle de usuario:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. CREAR USUARIO (POST /usuarios)
// ==========================================
module.exports.crear = async (req, res) => {
    try {
        const { nombres, apellidos, ci_ruc, id_rol, numero_vivienda, correo_login, password } = req.body;

        if (!nombres || !apellidos || !ci_ruc || !id_rol || !correo_login || !password) {
            return res.status(400).json({ msg: "Datos inválidos o incompletos" });
        }

        // Buscar vivienda si fue especificada
        let idVivienda = null;
        if (numero_vivienda) {
            const vivienda = await Vivienda.findOne({ where: { numero: numero_vivienda } });
            if (vivienda) {
                idVivienda = vivienda.id_vivienda;
            }
        }

        // Verificar si el correo ya existe
        const existe = await Usuario.findOne({ where: { correo_login } });
        if (existe) {
            return res.status(400).json({ msg: "El correo ya se encuentra registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const nuevaPersona = await Persona.create({
            nombres,
            apellidos,
            ci_ruc,
            correo: correo_login
        });

        const nuevoUsuario = await Usuario.create({
            id_persona: nuevaPersona.id_persona,
            id_rol,
            id_vivienda: idVivienda,
            correo_login,
            password_hash,
            fecha_registro: new Date(),
            estado: "ACTIVO"
        });

        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, "Usuario creado por administrador", req.ip, `Correo: ${correo_login}`);

        return res.status(201).json({
            id_usuario: nuevoUsuario.id_usuario,
            msg: "Usuario creado"
        });
    } catch (err) {
        console.error("Error en crear usuario:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 4. EDITAR USUARIO (PUT /usuarios/:id)
// ==========================================
module.exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellidos, correo, telefono, foto } = req.body;

        const usuario = await Usuario.findByPk(id, { include: [{ model: Persona }] });
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        if (usuario.persona) {
            if (nombres !== undefined) usuario.persona.nombres = nombres;
            if (apellidos !== undefined) usuario.persona.apellidos = apellidos;
            if (correo !== undefined) usuario.persona.correo = correo;
            if (telefono !== undefined) usuario.persona.telefono = telefono;
            if (foto !== undefined) usuario.persona.foto = foto;
            await usuario.persona.save();
        }

        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, `Datos del usuario #${id} editados`, req.ip);

        return res.status(200).json({ msg: "Usuario actualizado" });
    } catch (err) {
        console.error("Error en editar usuario:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 5. CAMBIAR ESTADO DE USUARIO (PATCH /usuarios/:id/estado)
// ==========================================
module.exports.cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        usuario.estado = estado;
        await usuario.save();

        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, `Estado del usuario #${id} cambiado a ${estado}`, req.ip);

        return res.status(200).json({ msg: "Estado actualizado" });
    } catch (err) {
        console.error("Error en cambiar estado de usuario:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 6. LISTAR SOLICITUDES PENDIENTES (GET /usuarios/solicitudes)
// ==========================================
module.exports.listarSolicitudes = async (req, res) => {
    try {
        const pendientes = await Usuario.findAll({
            where: { estado: "PENDIENTE" },
            include: [
                { model: Persona },
                { model: Vivienda }
            ]
        });

        let listaPendientes = [];
        for (let i = 0; i < pendientes.length; i++) {
            let u = pendientes[i];
            listaPendientes.push({
                id_usuario: u.id_usuario,
                nombres: u.persona ? u.persona.nombres : "",
                apellidos: u.persona ? u.persona.apellidos : "",
                ci_ruc: u.persona ? u.persona.ci_ruc : "",
                numero_vivienda: u.vivienda ? u.vivienda.numero : "Sin Asignar",
                fecha_registro: u.fecha_registro
            });
        }

        // Resumen de solicitudes
        const solicitudesHoy = await Usuario.count({ where: { estado: "PENDIENTE" } });
        const aprobadosMes = await Usuario.count({ where: { estado: "ACTIVO" } });
        const rechazados = await Usuario.count({ where: { estado: "RECHAZADO" } });

        return res.status(200).json({
            data: listaPendientes,
            resumen: {
                solicitudes_hoy: solicitudesHoy,
                aprobados_mes: aprobadosMes,
                rechazados: rechazados
            }
        });
    } catch (err) {
        console.error("Error en listar solicitudes:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 7. HISTORIAL DE SOLICITUDES (GET /usuarios/solicitudes/historial)
// ==========================================
module.exports.historialSolicitudes = async (req, res) => {
    try {
        const solicituResuelta = await Usuario.findAll({
            where: {
                estado: { [Op.in]: ["ACTIVO", "RECHAZADO"] }
            },
            include: [{ model: Persona }]
        });

        let listaSolicitudes = [];
        for (let i = 0; i < solicituResuelta.length; i++) {
            let u = solicituResuelta[i];
            listaSolicitudes.push({
                id_usuario: u.id_usuario,
                nombres: u.persona ? u.persona.nombres : "",
                apellidos: u.persona ? u.persona.apellidos : "",
                estado: u.estado,
                fecha_decision: u.fecha_decision,
                motivo_rechazo: u.motivo_rechazo
            });
        }

        return res.status(200).json({ data: listaSolicitudes });
    } catch (err) {
        console.error("Error en historial de solicitudes:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 8. APROBAR SOLICITUD (PATCH /usuarios/solicitudes/:id/aprobar)
// ==========================================
module.exports.aprobarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        if (usuario.estado !== "PENDIENTE") {
            return res.status(409).json({ msg: "La solicitud ya fue resuelta" });
        }

        usuario.estado = "ACTIVO";
        usuario.fecha_decision = new Date();
        await usuario.save();

        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, `Solicitud de registro aprobada para usuario #${id}`, req.ip);

        return res.status(200).json({ msg: "Usuario aprobado" });
    } catch (err) {
        console.error("Error en aprobar solicitud:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 9. RECHAZAR SOLICITUD (PATCH /usuarios/solicitudes/:id/rechazar)
// ==========================================
module.exports.rechazarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo_rechazo } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        if (usuario.estado !== "PENDIENTE") {
            return res.status(409).json({ msg: "La solicitud ya fue resuelta" });
        }

        usuario.estado = "RECHAZADO";
        usuario.motivo_rechazo = motivo_rechazo || "Solicitud no aprobada por la directiva";
        usuario.fecha_decision = new Date();
        await usuario.save();

        const modulo = await Modulo.findOne({ where: { nombre: "Usuarios" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, `Solicitud de registro rechazada para usuario #${id}`, req.ip, `Motivo: ${motivo_rechazo || "No especificado"}`);

        return res.status(200).json({ msg: "Usuario rechazado" });
    } catch (err) {
        console.error("Error en rechazar solicitud:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 10. HISTORIAL DE OPERACIONES (GET /usuarios/:id/historial)
// ==========================================
module.exports.historialOperaciones = async (req, res) => {
    try {
        const { id } = req.params;

        const ingresos = await Ingreso.findAll({ where: { id_usuario: id } });
        const egresos = await Egreso.findAll({ where: { id_usuario: id } });

        let registrosDeOperaciones = [];
        for (let i = 0; i < ingresos.length; i++) {
            registrosDeOperaciones.push({
                tipo: "INGRESO",
                descripcion: ingresos[i].descripcion,
                monto: ingresos[i].total_pagado,
                fecha: ingresos[i].fecha_pago
            });
        }
        for (let j = 0; j < egresos.length; j++) {
            registrosDeOperaciones.push({
                tipo: "EGRESO",
                descripcion: `Factura ${egresos[j].num_factura}`,
                monto: egresos[j].valor,
                fecha: egresos[j].fecha_comprobante
            });
        }

        return res.status(200).json({ data: registrosDeOperaciones });
    } catch (err) {
        console.error("Error en historial de operaciones:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};