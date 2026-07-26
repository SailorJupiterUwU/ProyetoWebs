const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const sequelize = require("./config/sequelize.config");

// Importación directa de modelos y sus relaciones
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la aplicación
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/usuarios", require("./routes/usuario.routes"));
app.use("/api/viviendas", require("./routes/vivienda.routes"));
app.use("/api/casas", require("./routes/vivienda.routes"));
app.use("/api/modulos", require("./routes/modulo.routes"));
app.use("/api/presupuestos", require("./routes/presupuesto.routes"));
app.use("/api/rubros", require("./routes/rubro.routes"));
app.use("/api/alicuotas", require("./routes/alicuota.routes"));
app.use("/api/multas", require("./routes/multa.routes"));
app.use("/api/ingresos", require("./routes/ingreso.routes"));
app.use("/api/proveedores", require("./routes/proveedor.routes"));
app.use("/api/egresos", require("./routes/egreso.routes"));
app.use("/api/reportes", require("./routes/reporte.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/visitantes", require("./routes/visitante.routes"));
app.use("/api/qr", require("./routes/qr.routes"));
app.use("/api/auditoria", require("./routes/auditoria.routes"));
app.use("/api/historial", require("./routes/historial.routes"));
app.use("/api/roles", require("./routes/rol.routes"));

const runSeeders = require("./seed/seeder");

const PORT = env.port || 3000;

sequelize.sync().then(async () => {
    console.log("Base de datos conectada correctamente.");
    await runSeeders();
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}).catch((err) => {
    console.error("Error al conectar con la base de datos:", err);
});
