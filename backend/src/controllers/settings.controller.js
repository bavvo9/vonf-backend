const SettingsModel = require('../models/settings.model');
const AppError = require('../utils/appError');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');

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

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    let { value } = req.body;

    // 1. Si subieron un archivo de imagen real (para logos o formulario)
    if (req.file) {
      value = await uploadImage(req.file.path);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); // Borrar temporal

      // SI ERA LA CLAVE TEMPORAL DEL CARRUSEL, DEVOLVEMOS LA URL DE CLOUDINARY DIRECTAMENTE
      if (key === 'temp_carousel_upload') {
        return res.status(200).json({
          status: 'success',
          data: { value: value }
        });
      }
    }

    // 2. Si es el carrusel dinámico, nos aseguramos de que guarde un JSON string válido
    if (key === 'hero_carousel_images' && value) {
      // Si por alguna razón llega como un array nativo, lo stringificamos
      if (Array.isArray(value)) {
        value = JSON.stringify(value);
      } else {
        // Si llega como string, validamos que sea un JSON válido para que no rompa la DB
        try {
          JSON.parse(value);
        } catch (e) {
          return next(new AppError('El valor para el carrusel debe ser una estructura de texto JSON válida.', 400));
        }
      }
    }

    if (!value && !req.file) {
      throw new AppError('Se requiere un valor o una imagen', 400);
    }

    // 3. LLAMADA REAL A TU MODELO (Usamos SettingsModel en vez de db)
    const updated = await SettingsModel.update(key, value);

    if (!updated) {
      throw new AppError('Configuración no encontrada', 404);
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

module.exports = { getSettings, updateSetting };