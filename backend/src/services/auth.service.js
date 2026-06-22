const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/token');
const {
  checkAccountLock,
  handleFailedLogin,
  resetLoginAttempts
} = require('../utils/loginSecurity');
const { sendVerificationEmail } = require('./email.service');

const User = require('../models/user.model');
const AppError = require('../utils/appError'); // Importamos la clase de error

const registerUser = async (email, password, firstName, lastName) => {
  
  //Verificamos que el mail no esté ya usado/registrado 
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    // Lanzamos un error 400 (Bad Request) con mensaje claro
    throw new AppError('El correo electrónico ya está registrado', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = generateToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  const user = await User.createUser({
      email,
      passwordHash: hashedPassword,
      verificationToken,
      expires,
      firstName, // Pasamos al modelo
      lastName   // Pasamos al modelo
  });

  //Le saqué el try await para que el proceso no dependa del envío del email, asi el usuario no queda esperando a los procesos internos
  sendVerificationEmail(email, verificationToken).catch(error => {
    console.error('❌ Error enviando email en segundo plano:', error);
  });

  return { user, verificationToken };
};

const loginUser = async (email, password) => {
  const user = await User.findByEmail(email);

  // Seguridad: Mensaje genérico o específico según política. Usamos específico aquí.
  if (!user) throw new AppError('Credenciales inválidas', 401);

  if (checkAccountLock(user)) {
    throw new AppError('Cuenta bloqueada temporalmente. Intentá más tarde.', 403);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    await handleFailedLogin(user);
    throw new AppError('Credenciales inválidas', 401);
  }

  await resetLoginAttempts(user.id);

  if (!user.is_verified) {
    throw new AppError('Verificá tu email antes de iniciar sesión', 403);
  }

  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });

  await User.updateRefreshToken(user.id, refreshToken);

  return { user, accessToken, refreshToken };
};


const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new AppError('Refresh token inválido o expirado', 401);
  }

  const user = await User.getRefreshToken(decoded.id);
 
  if (!user || user.refresh_token !== refreshToken) {
    throw new AppError('Refresh token inválido', 401);
  }

  const accessToken = jwt.sign(
    { id: decoded.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  return { 
    accessToken, 
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }
  };
};

const logoutUser = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await User.clearRefreshToken(decoded.id);
  } catch (err) {
    // Si el token es inválido al hacer logout, no es grave, pero podemos avisar
    throw new AppError('Token inválido', 401);
  }
};

const verifyEmail = async (token) => {
  const user = await User.verifyEmailByToken(token);
  if (!user) throw new AppError('Token inválido o expirado', 400);
  return { message: 'Email verificado correctamente' };
};

const resendVerificationEmail = async (email) => {
  const user = await User.findByEmail(email);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  
  if (user.is_verified) throw new AppError('El usuario ya está verificado', 400);

  const verificationToken = generateToken(); 
  
  //Expiracion del token de confirmacion de mail.
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  // 👇 MODIFICADO: Pasamos el token Y la fecha
  await User.updateEmailVerificationToken(user.id, verificationToken, expires);

  // 👇 ENVIAMOS EL EMAIL REAL
  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (error) {
    console.error('❌ Error reenviando email:', error);
    throw new AppError('No se pudo enviar el correo de verificación', 500);
  }

  return { 
    message: 'Email de verificación reenviado',
   };
};

module.exports = {
  registerUser, loginUser, refreshAccessToken, logoutUser, verifyEmail, resendVerificationEmail
};