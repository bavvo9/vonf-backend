const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const { getDashboard } = require('../controllers/dashboard.controller');

// 🔒 Solo Admins pueden entrar aquí
router.get('/', authMiddleware, adminMiddleware, getDashboard);

module.exports = router;