const SettingsModel = require('../models/settings.model');
const AppError = require('../utils/appError');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    let { value } = req.body;

    // 1. Si el usuario subió un archivo real desde su PC
    if (req.file) {
      // Subimos el archivo temporal a Cloudinary y obtenemos la URL premium
      const cloudinaryUrl = await uploadImage(req.file.path);
      
      // Borramos el archivo temporal local de inmediato para no llenar el server
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      // CASO A: Es una foto nueva para el CARRUSEL del Hero
      if (key === 'hero_carousel_images') {
        // Traemos lo que ya está guardado en la base de datos para no pisarlo
        const currentSetting = await SettingsModel.getByKey ? await SettingsModel.getByKey('hero_carousel_images') : null;
        let currentImages = [];
        
        if (currentSetting && currentSetting.value) {
          try {
            const parsed = JSON.parse(currentSetting.value);
            if (Array.isArray(parsed)) currentImages = parsed;
          } catch (e) {
            console.error('Error parseando imágenes existentes para el carrusel');
          }
        }
        
        // Agregamos la nueva URL de Cloudinary al array existente
        currentImages.push(cloudinaryUrl);
        value = JSON.stringify(currentImages);
      } 
      // CASO B: Es la imagen única del FORMULARIO de personalizados (u otra imagen directa)
      else {
        value = cloudinaryUrl;
      }
    }

    // 2. Si se mandó una actualización tradicional de texto plano o el borrado de carrusel (que manda string JSON)
    if (!req.file && key === 'hero_carousel_images' && value) {
      if (Array.isArray(value)) {
        value = JSON.stringify(value);
      } else {
        try {
          JSON.parse(value); // Validamos que sea un JSON string válido
        } catch (e) {
          return next(new AppError('Estructura de JSON inválida para el carrusel.', 400));
        }
      }
    }

    if (!value && !req.file) {
      throw new AppError('Se requiere un valor o un archivo válido para actualizar.', 400);
    }

    // 3. Impactamos el cambio real en la base de datos de Neon
    const updated = await SettingsModel.update(key, value);

    if (!updated) {
      throw new AppError('Configuración no encontrada en site_settings', 404);
    }

    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    // Limpieza de emergencia por si falló la subida a Cloudinary mitad de camino
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

module.exports = {
  // Asegurate de exportarlo de forma tradicional CommonJS junto a tu getSettings
  updateSetting,
  getSettings: require('./settings.controller').getSettings || (() => {}) 
};