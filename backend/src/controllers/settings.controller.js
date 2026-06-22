const SettingsModel = require('../models/settings.model');
const AppError = require('../utils/appError');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');

const getSettings = async (req, res, next) => {
  try {
    const settings = await SettingsModel.getAll();
    // Transformamos el array en un objeto { clave: valor } para facilitar uso en frontend
    // O devolvemos el array completo para el Admin Panel
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

    // 1. Si subieron un archivo, lo procesamos
    if (req.file) {
      value = await uploadImage(req.file.path);
      fs.unlinkSync(req.file.path); // Borrar temporal
    }

    if (!value && !req.file) {
      throw new AppError('Se requiere un valor o una imagen', 400);
    }

    // 2. Actualizar en DB
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