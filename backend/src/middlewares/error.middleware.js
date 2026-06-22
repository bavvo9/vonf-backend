const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Loguear el error en la consola (para que tú lo veas)
  console.error('💥 ERROR:', err);

  // Manejo de errores específicos de base de datos (Postgres)
  if (err.code === '23505') { // Unique constraint (ej: email duplicado)
    return res.status(409).json({
      status: 'fail',
      error: 'El registro ya existe (dato duplicado).'
    });
  }

  if (err.code === '22P02') { // Invalid input syntax (ej: mandar texto donde va un ID numérico)
    return res.status(400).json({
      status: 'fail',
      error: 'Dato inválido o formato incorrecto.'
    });
  }
  
  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
  }
  if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
  }

  // Respuesta genérica al cliente
  res.status(statusCode).json({
    status: err.status || 'error',
    error: message
  });
};

module.exports = errorHandler;