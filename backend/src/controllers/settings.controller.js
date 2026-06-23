const SettingsModel = require('../models/settings.model');
const AppError = require('../utils/appError');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');

const getSettings = async (req, res, next) => {
  try {
    const settings = await SettingsModel.getAll();
    res.json({ status: 'success', data: settings });
  } catch (error) {
    next(error);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    let { value } = req.body;

    // 1. Manejo de archivos binarios (Multer)
    if (req.file) {
      // Subimos el archivo a Cloudinary
      const cloudinaryUrl = await uploadImage(req.file.path);
      
      // Borramos el archivo temporal del servidor (Render) para liberar espacio
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      // FRENO CRÍTICO: Si es la clave temporal del carrusel, NO vamos a la base de datos.
      // Solo devolvemos la URL de Cloudinary para que el Frontend arme el JSON.
      if (key === 'temp_carousel_upload') {
        return res.json({
          status: 'success',
          data: { value: cloudinaryUrl }
        });
      }

      // Si es custom_form_image u otra, asignamos la URL para guardarla en Neon
      value = cloudinaryUrl;
    }

    // 2. Manejo de JSON para el Carrusel (cuando se elimina una foto o se actualiza la lista)
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

    // 3. Guardado en la base de datos
    const updated = await SettingsModel.update(key, value);

    if (!updated) {
      throw new AppError('Configuración no encontrada en site_settings', 404);
    }

    res.json({ status: 'success', data: updated });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSetting
};