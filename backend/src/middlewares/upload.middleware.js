const multer = require('multer');
const path = require('path');
const os = require('os'); // Importamos el módulo nativo del sistema operativo

// Configuración de almacenamiento local temporal
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // REEMPLAZO CLAVE: Usamos el directorio temporal del servidor (Render)
    // Esto evita el crash porque esta ruta SIEMPRE existe en producción
    cb(null, os.tmpdir()); 
  },
  filename: (req, file, cb) => {
    // Nombre único: fecha + extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('No es una imagen! Por favor sube solo imágenes.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Límite de 5MB
});

module.exports = upload;