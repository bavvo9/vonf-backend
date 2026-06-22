const adminMiddleware = (req, res, next) => {
  if (!req.user) { //Por si no está logueado, esto no debería pasar nunca 
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }

  next();
};

module.exports = adminMiddleware;
