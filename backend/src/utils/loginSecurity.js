// utils/loginSecurity.js
const pool = require('../db/index.js');

/**
 * Verifica si la cuenta está bloqueada
 * Devuelve true si está bloqueada y responde al cliente
 */
const checkAccountLock = (user, res) => {
  if (user.lock_until && new Date(user.lock_until) > new Date()) {
    res.status(403).json({
      error: 'Cuenta bloqueada temporalmente. Intentá más tarde.'
    });
    return true;
  }
  return false;
};

/**
 * Maneja un intento de login fallido
 * Incrementa contador y bloquea si supera el límite
 */
const handleFailedLogin = async (user) => {
  let attempts = user.failed_login_attempts + 1;
  let lockUntil = null;

  if (attempts >= 5) {
    lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    attempts = 0;
  }

  await pool.query(
    `
    UPDATE users
    SET failed_login_attempts = $1,
        lock_until = $2
    WHERE id = $3
    `,
    [attempts, lockUntil, user.id]
  );
};

/**
 * Resetea contadores luego de login exitoso
 */
const resetLoginAttempts = async (userId) => {
  await pool.query(
    `
    UPDATE users
    SET failed_login_attempts = 0,
        lock_until = NULL
    WHERE id = $1
    `,
    [userId]
  );
};

module.exports = {
  checkAccountLock,
  handleFailedLogin,
  resetLoginAttempts
};
