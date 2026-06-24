const multer = require('multer');

// OPTIMIZACIÓN: Usamos memoria RAM en lugar del disco duro de Render.
// Es muchísimo más rápido y no requiere generar ni borrar archivos temporales.
const storage = multer.memoryStorage();

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