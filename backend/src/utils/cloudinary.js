require('dotenv').config(); // 1. FORZAMOS A QUE LEA EL .env SÍ O SÍ
const cloudinary = require('cloudinary').v2;

// 2. Imprimimos en consola si realmente está encontrando tus credenciales
console.log("☁️ Test de Credenciales de Cloudinary:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "Cargado OK" : "❌ FALTA",
  api_key: process.env.CLOUDINARY_API_KEY ? "Cargado OK" : "❌ FALTA",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Cargado OK" : "❌ FALTA"
});

// Configuración global
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (filePath) => {
  try {
    // Subimos la imagen a una carpeta llamada 'vonf-products'
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'vonf-products'
    });
    return result.secure_url; // Devolvemos el link HTTPS
  } catch (error) {
    // 3. MOSTRAMOS EL ERROR REAL EN LA CONSOLA PARA VER QUÉ FALLA
    console.error('\n🔥 ERROR CRÍTICO RECHAZADO POR CLOUDINARY:', error, '\n');
    throw new Error(`Error Cloudinary: ${error.message || 'Desconocido'}`);
  }
};

module.exports = { uploadImage };