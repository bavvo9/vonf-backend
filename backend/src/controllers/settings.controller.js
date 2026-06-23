const SettingsModel = require('../models/settings.model');
const AppError = require('../utils/appError');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');

// 1. OBTENER CONFIGURACIONES (Limpio y directo)
const getSettings = async (req, res, next) => {
  try {
    const settings = await SettingsModel.getAll();
    res.json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// 2. ACTUALIZAR CONFIGURACIÓN (Manejando archivos binarios y strings JSON)
const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    let { value } = req.body;

    // Si el usuario subió un archivo real desde su PC
    if (req.file) {
      const cloudinaryUrl = await uploadImage(req.file.path);
      
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      // Si es el carrusel, sumamos la URL al array existente
      if (key === 'hero_carousel_images') {
        const currentSetting = await SettingsModel.getByKey(key);
        let currentImages = [];
        
        if (currentSetting && currentSetting.value) {
          try {
            const parsed = JSON.parse(currentSetting.value);
            if (Array.isArray(parsed)) currentImages = parsed;
          } catch (e) {
            console.error('Error parseando imágenes existentes');
          }
        }
        
        currentImages.push(cloudinaryUrl);
        value = JSON.stringify(currentImages);
      } 
      // Si es la imagen única del formulario
      else {
        value = cloudinaryUrl;
      }
    }

    // Si viene del frontend como string JSON tradicional (borrar imagen, etc.)
    if (!req.file && key === 'hero_carousel_images' && value) {
      if (Array.isArray(value)) {
        value = JSON.stringify(value);
      } else {
        try {
          JSON.parse(value);
        } catch (e) {
          return next(new AppError('Estructura de JSON inválida para el carrusel.', 400));
        }
      }
    }

    if (!value && !req.file) {
      throw new AppError('Se requiere un valor o un archivo válido para actualizar.', 400);
    }

    const updated = await SettingsModel.update(key, value);

    if (!updated) {
      throw new AppError('Configuración no encontrada en site_settings', 404);
    }

    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

// 3. EXPORTACIÓN LIMPIA COMMONJS (Sin vueltas)
module.exports = {
  getSettings,
  updateSetting
};