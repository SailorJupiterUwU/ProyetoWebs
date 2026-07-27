const Rol = require("../models/rol.model");
const Modulo = require("../models/modulo.model");
const RolModulo = require("../models/rolModulo.model");
const { registrarAuditoria } = require("../utils/auditoria.util");

// ==========================================
// 1. LISTAR ROLES (GET /roles)
// ==========================================
module.exports.listar = async (req, res) => {
    try {
        const rolesBDD = await Rol.findAll();

        let listaRoles = [];
        for (let i = 0; i < rolesBDD.length; i++) {
            let r = rolesBDD[i];
            listaRoles.push({
                id_rol: r.id_rol,
                codigo: r.codigo,
                nombre: r.nombre,
                descripcion: r.descripcion,
                estado: r.estado
            });
        }

        return res.status(200).json({ data: listaRoles });
    } catch (err) {
        console.error("Error en listar roles:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 2. CREAR ROL (POST /roles)
// ==========================================
module.exports.crear = async (req, res) => {
    try {
        const { codigo, nombre, descripcion } = req.body;

        if (!codigo || !nombre) {
            return res.status(400).json({ msg: "El código y nombre del rol son obligatorios" });
        }

        const nuevoRol = await Rol.create({
            codigo: codigo,
            nombre: nombre,
            descripcion: descripcion || "",
            estado: true
        });

        const modulo = await Modulo.findOne({ where: { nombre: "Roles" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, `Rol creado: ${nombre}`, req.ip);

        return res.status(201).json({
            id_rol: nuevoRol.id_rol,
            msg: "Rol creado"
        });
    } catch (err) {
        console.error("Error en crear rol:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 3. EDITAR ROL (PUT /roles/:id)
// ==========================================
module.exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        if( !nombre || !descripcion){
            res.status(400).json({msg: "El nombre y descripción son obligatorios"})
        }
        const rol = await Rol.findByPk(id);
        if (!rol) {
            return res.status(404).json({ msg: "Rol no encontrado" });
        }

        if (nombre !== undefined) {
            rol.nombre = nombre;
        }
        if (descripcion !== undefined) {
            rol.descripcion = descripcion;
        }

        await rol.save();

        const modulo = await Modulo.findOne({ where: { nombre: "Roles" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, `Rol #${id} editado`, req.ip);

        return res.status(200).json({ msg: "Rol actualizado" });
    } catch (err) {
        console.error("Error en editar rol:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 4. CAMBIAR ESTADO DE ROL (PATCH /roles/:id/estado)
// ==========================================
module.exports.cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const rol = await Rol.findByPk(id);
        if (!rol) {
            return res.status(404).json({ msg: "Rol no encontrado" });
        }

        rol.estado = estado;
        await rol.save();

        const modulo = await Modulo.findOne({ where: { nombre: "Roles" } });
        await registrarAuditoria(req.usuario?.id_usuario, modulo?.id_modulo, `Estado del rol #${id} cambiado a ${estado}`, req.ip);

        return res.status(200).json({ msg: "Estado actualizado" });
    } catch (err) {
        console.error("Error en cambiar estado de rol:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 5. OBTENER MÓDULOS DE UN ROL (GET /roles/:id/modulos)
// ==========================================
module.exports.obtenerModulos = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener todos los módulos del sistema
        const todosLosModulos = await Modulo.findAll();

        // Obtener los IDs de módulos actualmente asignados a este rol
        const asignaciones = await RolModulo.findAll({ where: { id_rol: id } });
        
        let idsAsignados = [];
        for (let i = 0; i < asignaciones.length; i++) {
            idsAsignados.push(asignaciones[i].id_modulo);
        }

        // Armar el listado indicando si cada módulo está asignado (true/false)
        let modulos = [];
        for (let j = 0; j < todosLosModulos.length; j++) {
            let m = todosLosModulos[j];
            let estaAsignado = false;

            if (idsAsignados.includes(m.id_modulo)) {
                estaAsignado = true;
            }

            modulos.push({
                id_modulo: m.id_modulo,
                nombre: m.nombre,
                asignado: estaAsignado
            });
        }

        return res.status(200).json({ data: modulos });
    } catch (err) {
        console.error("Error en obtener módulos del rol:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};

// ==========================================
// 6. ACTUALIZAR MÓDULOS ASIGNADOS A UN ROL (PUT /roles/:id/modulos)
// ==========================================
module.exports.actualizarModulos = async (req, res) => {
    try {
        const { id } = req.params;
        const { modulos } = req.body; 

        const rol = await Rol.findByPk(id);
        if (!rol) {
            return res.status(404).json({ msg: "Rol no encontrado" });
        }

        // 1. Eliminar las asignaciones anteriores de este rol
        await RolModulo.destroy({ where: { id_rol: id } });

        // 2. Insertar las nuevas asignaciones
        if (modulos && Array.isArray(modulos)) {
            for (let i = 0; i < modulos.length; i++) {
                await RolModulo.create({
                    id_rol: id,
                    id_modulo: modulos[i]
                });
            }
        }

        const moduloBD = await Modulo.findOne({ where: { nombre: "Roles" } });
        await registrarAuditoria(req.usuario?.id_usuario, moduloBD?.id_modulo, `Permisos de módulos actualizados para rol #${id}`, req.ip, `Módulos asignados: [${modulos?.join(", ")}]`);

        return res.status(200).json({ msg: "Permisos actualizados" });
    } catch (err) {
        console.error("Error en actualizar módulos del rol:", err);
        return res.status(500).json({ msg: "Error interno del servidor", error: err.message });
    }
};
