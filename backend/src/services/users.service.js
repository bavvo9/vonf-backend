const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { validatePassword } = require('../utils/passwordPolicy');
const AppError = require('../utils/appError');

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  // 1. Buscamos usuario con password hash
  const user = await User.findByIdWithPassword(userId);
  if (!user) throw new AppError('Usuario no encontrado', 404);

  // 2. Verificamos contraseña actual
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new AppError('Contraseña actual incorrecta', 401);

  // 3. Validamos complejidad de la nueva contraseña
  const passwordError = validatePassword(newPassword);
  if (passwordError) throw new AppError(passwordError, 400);

  // 4. Actualizamos
  const hash = await bcrypt.hash(newPassword, 10);
  await User.updatePassword(userId, hash);
  await User.clearRefreshToken(userId);
};

const getAllUsers = async () => {
  return await User.findAll();
};


module.exports = { getMe, changePassword, getAllUsers};