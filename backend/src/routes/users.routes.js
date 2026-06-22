const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware'); // Importar admin middleware

const {
    getMe,
    changePassword,
    getAllUsers
} = require('../controllers/users.controller');


router.get('/me', auth, getMe);
router.put('/change-password', auth, changePassword);
router.get('/', auth, admin, getAllUsers);


module.exports = router;
