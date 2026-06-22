const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const {getSettings, updateSetting} = require('../controllers/settings.controller');

// Público: Cualquiera puede leer la configuración (para mostrar la imagen en el front)
router.get('/', getSettings);


// Privado (Solo Admin): Modificar valores
// Usamos upload.single('image') por si quieren subir una foto nueva
router.put('/:key',  authMiddleware, adminMiddleware, upload.single('image'), updateSetting);

module.exports = router;