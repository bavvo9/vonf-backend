const UserService = require('../services/users.service');

const getMe = async (req, res, next) => {
  try {
    const user = await UserService.getMe(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    // Nota: Podrías lanzar esto desde el servicio también, pero validar input básico en controller es aceptable
    // Para ser consistentes con 'AppError', podrías usar next(new AppError(...))
    // Pero lo ideal es dejar que el servicio valide lógica.
  }

  try {
    // Si faltan datos, el servicio podría quejarse o lo validamos aquí rápido
    if (!currentPassword || !newPassword) {
       throw new Error('Datos incompletos'); // Esto lo atrapará el catch y lo puedes convertir
    }
    
    await UserService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Contraseña actualizada. Volvé a iniciar sesión.' });
  } catch (error) {
    if (error.message === 'Datos incompletos') {
        return next(new AppError('Datos incompletos', 400)); // Usamos AppError aquí si queremos
    }
    next(error);
  }
};


const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, changePassword, getAllUsers};