require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream'); // <-- Importación nativa súper importante

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // FRENO DE EMERGENCIA: Si el archivo viene vacío o pasaste req.file.path por error
    if (!fileBuffer) {
      return reject(new Error("🚨 ARCHIVO VACÍO: Revisá tu controlador y asegurate de estar enviando 'req.file.buffer' en lugar de 'req.file.path'"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'vonf-products',
        format: 'webp',
        quality: 'auto',
        width: 1920,
        crop: 'limit'
      },
      (error, result) => {
        if (error) {
          console.error('\n🔥 ERROR CRÍTICO CLOUDINARY:', error, '\n');
          return reject(new Error(`Error Cloudinary: ${error.message || 'Desconocido'}`));
        }
        resolve(result.secure_url);
      }
    );

    // INYECCIÓN PERFECTA: Convertimos la RAM (Buffer) en un flujo de lectura y lo conectamos a Cloudinary
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

module.exports = { uploadImage };