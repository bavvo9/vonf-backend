require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// OPTIMIZACIÓN: Ahora recibimos un "buffer" (RAM) en vez de un "filePath" (Disco)
const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // Usamos el método de stream directo
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'vonf-products',
        format: 'webp',      // Convierte forzadamente a WebP (ultra liviano para la web)
        quality: 'auto',     // Cloudinary decide la mejor compresión sin perder calidad visual
        width: 1920,         // Limita el ancho para que no se guarden fotos 4K gigantes
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

    // Inyectamos el archivo de la memoria directo a la tubería de subida
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadImage };