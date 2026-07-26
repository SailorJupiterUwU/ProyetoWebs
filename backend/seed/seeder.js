const sequelize = require("../config/sequelize.config");
const bcrypt = require("bcryptjs");

// Importación de modelos
const Rol = require("../models/rol.model");
const Modulo = require("../models/modulo.model");
const RolModulo = require("../models/rolModulo.model");
const Vivienda = require("../models/vivienda.model");
const PeriodoDirectiva = require("../models/periodoDirectiva.model");
const Rubro = require("../models/rubro.model");
const Persona = require("../models/persona.model");
const Usuario = require("../models/usuario.model");

/**
 * Script de Siembra de Datos Iniciales (Catálogos y Datos Semilla)
 */
async function runSeeders() {
  console.log("🌱 Iniciando proceso de carga de catálogos y datos semilla...");

  try {
    // 1. Sembrar Roles Base
    const rolesData = [
      { codigo: "PRESIDENTA", nombre: "Presidenta", descripcion: "Presidenta / Administración Principal del Condominio" },
      { codigo: "TESORERA", nombre: "Tesorera", descripcion: "Tesorera / Gestión Financiera y Contable" },
      { codigo: "RESIDENTE", nombre: "Residente", descripcion: "Residente / Copropietario del Condominio" },
      { codigo: "GUARDIA", nombre: "Guardia", descripcion: "Personal de Seguridad / Garita" },
    ];

    const rolesMap = {};
    for (const r of rolesData) {
      const [rolInstance] = await Rol.findOrCreate({
        where: { nombre: r.nombre },
        defaults: r,
      });
      rolesMap[r.nombre] = rolInstance;
    }
    console.log("✅ Catálogo de Roles cargado.");

    // 2. Sembrar Módulos del Sistema
    const modulosData = [
      "Dashboard",
      "Usuarios",
      "Roles",
      "Presupuestos",
      "Ingresos",
      "Egresos",
      "Control QR",
      "Auditoria",
      "Reportes",
    ];

    const modulosMap = {};
    for (const nombreModulo of modulosData) {
      const [moduloInstance] = await Modulo.findOrCreate({
        where: { nombre: nombreModulo },
        defaults: { nombre: nombreModulo },
      });
      modulosMap[nombreModulo] = moduloInstance;
    }
    console.log("✅ Catálogo de Módulos cargado.");

    // 3. Sembrar Relaciones Rol-Módulo (Permisos)
    const asignacionesPermisos = {
      Presidenta: [
        "Dashboard",
        "Usuarios",
        "Roles",
        "Presupuestos",
        "Ingresos",
        "Egresos",
        "Control QR",
        "Auditoria",
        "Reportes",
      ],
      Tesorera: [
        "Dashboard",
        "Presupuestos",
        "Ingresos",
        "Egresos",
        "Control QR",
        "Auditoria",
        "Reportes",
      ],
      Residente: ["Ingresos", "Control QR"],
      Guardia: ["Control QR"],
    };

    for (const [nombreRol, listaModulos] of Object.entries(asignacionesPermisos)) {
      const rolObj = rolesMap[nombreRol];
      if (rolObj) {
        for (const nombreModulo of listaModulos) {
          const modObj = modulosMap[nombreModulo];
          if (modObj) {
            await RolModulo.findOrCreate({
              where: {
                id_rol: rolObj.id_rol,
                id_modulo: modObj.id_modulo,
              },
              defaults: {
                id_rol: rolObj.id_rol,
                id_modulo: modObj.id_modulo,
              },
            });
          }
        }
      }
    }
    console.log("✅ Relaciones Rol-Módulo (Matriz de Permisos) cargadas.");

    // 4. Sembrar Periodo Directiva Inicial
    const [periodoActivo] = await PeriodoDirectiva.findOrCreate({
      where: { estado: "ACTIVO" },
      defaults: {
        fecha_inicio: new Date().toISOString().split("T")[0],
        saldo_inicial: 0.0,
        estado: "ACTIVO",
      },
    });
    console.log("✅ Periodo de Directiva Inicial cargado.");

    // 5. Sembrar Rubros Base
    const rubrosData = [
      { codigo: "RUB-ING-01", nombre: "Alícuota Ordinaria Mensual", tipo: "INGRESO" },
      { codigo: "RUB-ING-02", nombre: "Multa por Incumplimiento", tipo: "INGRESO" },
      { codigo: "RUB-EGR-01", nombre: "Mantenimiento Garita y Jardines", tipo: "EGRESO" },
      { codigo: "RUB-EGR-02", nombre: "Servicios Básicos Comunes", tipo: "EGRESO" },
    ];

    for (const rubro of rubrosData) {
      await Rubro.findOrCreate({
        where: { codigo: rubro.codigo },
        defaults: rubro,
      });
    }
    console.log("✅ Rubros Base cargados.");

    // 6. Sembrar Viviendas de Muestra
    const viviendasData = [
      { numero: "Mz. A - Villa 1", porcentaje_alicuota: 0.0500 },
      { numero: "Mz. A - Villa 2", porcentaje_alicuota: 0.0500 },
      { numero: "Mz. B - Villa 1", porcentaje_alicuota: 0.0500 },
    ];

    const viviendasMap = {};
    for (const viv of viviendasData) {
      const [vivInstance] = await Vivienda.findOrCreate({
        where: { numero: viv.numero },
        defaults: viv,
      });
      viviendasMap[viv.numero] = vivInstance;
    }
    console.log("✅ Viviendas Iniciales cargadas.");

    // 7. Sembrar Usuario Administrador Inicial (Presidenta)
    const correoAdmin = "presidenta@condosecure.com";
    const usuarioExistente = await Usuario.findOne({ where: { correo_login: correoAdmin } });

    if (!usuarioExistente) {
      const [personaAdmin] = await Persona.findOrCreate({
        where: { ci_ruc: "0999999999" },
        defaults: {
          nombres: "Directiva",
          apellidos: "Presidenta",
          ci_ruc: "0999999999",
          correo: correoAdmin,
          telefono: "0999999999",
        },
      });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin123*", salt);

      await Usuario.create({
        id_persona: personaAdmin.id_persona,
        id_rol: rolesMap["Presidenta"].id_rol,
        id_periodo_directiva: periodoActivo.id_periodo,
        correo_login: correoAdmin,
        password_hash: hashedPassword,
        fecha_registro: new Date(),
        estado: "ACTIVO",
      });
      console.log(`✅ Usuario Admin creado por defecto: ${correoAdmin} / clave: Admin123*`);
    } else {
      console.log("ℹ️ Usuario Admin ya existía previamente.");
    }

    console.log("🎉 ¡Proceso de siembra de datos completado exitosamente!");
  } catch (error) {
    console.error("❌ Error durante la ejecución del seeder:", error);
  }
}

// Si se ejecuta directamente desde la consola
if (require.main === module) {
  sequelize.sync().then(async () => {
    await runSeeders();
    process.exit(0);
  });
}

module.exports = runSeeders;
