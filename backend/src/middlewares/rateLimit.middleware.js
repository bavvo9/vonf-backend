const rateLimit = require('express-rate-limit');

// 1. Limitador General (Para toda la API)
// Permite 100 peticiones cada 15 minutos por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, 
  message: {
    status: 'fail',
    error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true, // Devuelve info en las cabeceras `RateLimit-*`
  legacyHeaders: false,
});

// 2. Limitador Estricto (Para Login/Register)
// Solo 100 intentos por hora para crear cuentas o loguearse (evita fuerza bruta masiva)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // Un poco más holgado que 5 para no frustrar usuarios reales que se equivoquen
  message: {
    status: 'fail',
    error: 'Demasiados intentos de inicio de sesión. Intenta más tarde.'
  }
});

module.exports = { globalLimiter, authLimiter };