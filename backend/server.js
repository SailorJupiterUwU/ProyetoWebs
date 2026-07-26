const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const sequelize = require("./config/sequelize.config");

const PORT = env.port || 3000;

// MODELOS
require("./models/persona.model");
require("./models/rol.model");
require("./models/modulo.model");
require("./models/rolModulo.model");
require("./models/vivienda.model");
require("./models/periodoDirectiva.model");
require("./models/presupuesto.model");
require("./models/rubro.model");
require("./models/presupuestoRubro.model");
require("./models/alicuota.model");
require("./models/multa.model");
require("./models/usuario.model");
require("./models/ingreso.model");
require("./models/proveedor.model");
require("./models/egreso.model");
require("./models/reporteFinanciero.model");
require("./models/visitante.model");
require("./models/codigoQr.model");
require("./models/tokenRecuperacion.model");
require("./models/auditoria.model");

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// RUTAS

// AUTHENTICACION
const allAuthRoutes = require("./routes/auth.routes");
app.use("/api/auth", allAuthRoutes);

// USUARIOS
const allUsuariosRoutes = require("./routes/usuario.routes");
app.use("/api/usuarios", allUsuariosRoutes);

// VIVIENDAS / CASAS
const allViviendasRoutes = require("./routes/vivienda.routes");
app.use("/api/viviendas", allViviendasRoutes);
app.use("/api/casas", allViviendasRoutes);

// MODULOS
const allModulosRoutes = require("./routes/modulo.routes");
app.use("/api/modulos", allModulosRoutes);

// PRESUPUESTOS
const allPresupuestosRoutes = require("./routes/presupuesto.routes");
app.use("/api/presupuestos", allPresupuestosRoutes);

// RUBROS
const allRubrosRoutes = require("./routes/rubro.routes");
app.use("/api/rubros", allRubrosRoutes);

// ALICUOTAS
const allAlicuotasRoutes = require("./routes/alicuota.routes");
app.use("/api/alicuotas", allAlicuotasRoutes);

// MULTAS
const allMultasRoutes = require("./routes/multa.routes");
app.use("/api/multas", allMultasRoutes);

// INGRESOS
const allIngresosRoutes = require("./routes/ingreso.routes");
app.use("/api/ingresos", allIngresosRoutes);

// PROVEEDORES
const allProveedoresRoutes = require("./routes/proveedor.routes");
app.use("/api/proveedores", allProveedoresRoutes);

// EGRESOS
const allEgresosRoutes = require("./routes/egreso.routes");
app.use("/api/egresos", allEgresosRoutes);

// REPORTES
const allReportesRoutes = require("./routes/reporte.routes");
app.use("/api/reportes", allReportesRoutes);

// DASHBOARD
const allDashboardRoutes = require("./routes/dashboard.routes");
app.use("/api/dashboard", allDashboardRoutes);

// VISITANTES
const allVisitantesRoutes = require("./routes/visitante.routes");
app.use("/api/visitantes", allVisitantesRoutes);

// QR
const allQrRoutes = require("./routes/qr.routes");
app.use("/api/qr", allQrRoutes);

// AUDITORIA
const allAuditoriaRoutes = require("./routes/auditoria.routes");
app.use("/api/auditoria", allAuditoriaRoutes);

// HISTORIAL
const allHistorialRoutes = require("./routes/historial.routes");
app.use("/api/historial", allHistorialRoutes);

// ROLES
const allRolesRoutes = require("./routes/rol.routes");
app.use("/api/roles", allRolesRoutes);

const runSeeders = require("./seed/seeder");


// Conecta a la base y levanta el servidor
sequelize.sync().then(async () => {
    console.log("Base de datos conectada correctamente.");
    await runSeeders();
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}).catch((err) => {
    console.error("Error al conectar con la base de datos:", err);
});

