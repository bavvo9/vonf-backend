const authService = require('../services/auth.service');
const { generateCsrfToken } = require('../middlewares/csrf.middleware');
const { validatePassword } = require('../utils/passwordPolicy');
const AppError = require('../utils/appError');

const register = async (req, res, next) => {
  // 1. Extraemos nombre y apellido del body
  const { email, password, first_name, last_name } = req.body;

  // 2. Validación básica (Opcional: podrías hacerlo más estricto)
  if (!first_name || !last_name) {
      return next(new AppError('Nombre y Apellido son obligatorios', 400));
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return next(new AppError(passwordError, 400));
  }

  try {
    // 3. Pasamos los 4 argumentos
    await authService.registerUser(email, password, first_name, last_name);

    res.status(201).json({
      message: 'Usuario creado. Revisá tu email para verificar la cuenta.'
    });

  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  

  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
    const csrfToken = generateCsrfToken(res);


    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false // true en Produccion
      })
      .cookie('csrfToken', csrfToken, {
        httpOnly: false,
        sameSite: 'strict',
        secure: false
      })
      .json({
        accessToken,
        csrfToken,
        user: { id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name:user.last_name}
      });

  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new AppError('No autenticado', 401));
  }
   
  try {
    const { accessToken, user } = await authService.refreshAccessToken(refreshToken);
    res.json({ 
        accessToken, 
        user 
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new AppError('No autenticado', 400));
  }

  try {
    await authService.logoutUser(refreshToken);
    res
      .clearCookie('refreshToken')
      .clearCookie('csrfToken')
      .json({ message: 'Logout exitoso' });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.query.token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const result = await authService.resendVerificationEmail(req.body.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register, login, refresh, logout, verifyEmail, resendVerificationEmail
};