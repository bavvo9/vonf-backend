const cloudinary = require('cloudinary').v2;

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
    throw new Error('Error subiendo imagen a Cloudinary');
  }
};

module.exports = { uploadImage };