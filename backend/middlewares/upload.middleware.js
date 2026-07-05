const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carpetaDestino = path.join(__dirname, "..", "uploads", "presupuestos");

// Crear la carpeta si no existe
if (!fs.existsSync(carpetaDestino)) {
    fs.mkdirSync(carpetaDestino, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, carpetaDestino),
    filename: (req, file, cb) => {
        const nombreUnico = `${Date.now()}-${file.originalname}`;
        cb(null, nombreUnico);
    }
});

const filtroArchivo = (req, file, cb) => {
    const extensionesValidas = [".xlsx", ".xls", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (extensionesValidas.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos .xlsx, .xls o .csv"));
    }
};

const upload = multer({ storage, fileFilter: filtroArchivo });

module.exports = upload;