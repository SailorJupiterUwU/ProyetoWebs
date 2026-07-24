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
app.use("/api/casas", require("./routes/casa.routes"));
app.use("/api/presupuestos", require("./routes/presupuesto.routes"));
app.use("/api/roles", require("./routes/rol.routes"));

const PORT = env.port || 3000;

sequelize.sync().then(() => {
    console.log("Base de datos conectada correctamente.");
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}).catch((err) => {
    console.error("Error al conectar con la base de datos:", err);
});
