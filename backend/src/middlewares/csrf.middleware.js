const crypto = require('crypto');

const generateCsrfToken = (res) => {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie('csrfToken', token, {
    httpOnly: false, // 👈 JS puede leerlo
    sameSite: 'strict',
    secure: false    // true en prod (HTTPS)
  });

  return token;
};

const verifyCsrfToken = (req, res, next) => {
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({ error: 'CSRF token faltante' });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'CSRF token inválido' });
  }

  next();
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken
};