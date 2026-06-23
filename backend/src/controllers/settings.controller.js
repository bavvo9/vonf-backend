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

// backend/src/controllers/settings.controller.js

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    let { value } = req.body;

    // Si detectamos que mandamos el carrusel de imágenes, lo empaquetamos como JSON string
    if (key === 'hero_carousel_images') {
      if (Array.isArray(value)) {
        value = JSON.stringify(value);
      } else if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (e) {
          return res.status(400).json({ 
            status: 'error', 
            message: 'El valor para las imágenes del carrusel debe ser un array válido.' 
          });
        }
      }
    }

    // Tu consulta SQL actual apuntando a la tabla correcta que descubrimos
    const query = `
      UPDATE site_settings 
      SET value = $1, updated_at = NOW() 
      WHERE key = $2 
      RETURNING *
    `;
    
    const result = await db.query(query, [value, key]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró la configuración especificada.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSetting };