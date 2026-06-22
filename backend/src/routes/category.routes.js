const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory } = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/', getAllCategories); // Público
router.post('/', authMiddleware, adminMiddleware, createCategory); // Solo Admin

module.exports = router;