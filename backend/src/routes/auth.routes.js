const express = require('express');
const router = express.Router();
const {verifyCsrfToken} = require('../middlewares/csrf.middleware.js');

const {
    register,
    login,
    refresh,
    logout,
    verifyEmail,
    resendVerificationEmail
} = require('../controllers/auth.controller.js');


router.post('/register', register);
router.post('/login', login);
router.get('/refresh', refresh);
router.post('/logout',verifyCsrfToken, logout);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;
