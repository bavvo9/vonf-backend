const express = require('express');
require('dotenv').config(); //Para generar tokems
const app = express();

app.set('trust proxy', 1); //Para que no considere al servidor como un usuario por el que pasan todas las peticiones 

const errorHandler = require('./middlewares/error.middleware'); // <--- manejo de erroes
const cors = require('cors'); // 👈 Importar para frontend

//IMPORTAR SEGURIDAD
const helmet = require('helmet');
const { globalLimiter, authLimiter } = require('./middlewares/rateLimit.middleware');



require('./db/index.js');

// CONFIGURAR CORS (Permitir que el frontend nos hable)
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3001';

app.use(cors({
  origin: frontendURL, 
  credentials: true
}));

//APLICAR HELMET (Lo primero de todo, por seguridad)
app.use(helmet());

//APLICAR LIMITADOR GLOBAL
app.use(globalLimiter);

//Para que interprete los datos que doy desde el body
app.use(express.json());

//Rutas
//const cartRouter = require('./routes/cart.routes');
//const ordersRouter = require('./routes/orders.routes');
const productsRouter = require('./routes/products.routes.js');
const usersRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes');
//const dashboardRoutes = require ('./routes/dashboard.routes.js');
//const addressRoutes = require('./routes/address.routes');
const categoryRoutes = require('./routes/category.routes');
const customForm = require('./routes/custom.routes');
const settingsRoutes = require('./routes/settings.routes');
const cookieParser = require('cookie-parser');


//Uso de funciones
app.use(cookieParser()); //Para uso de cookies
app.use('/products', productsRouter); //Stock
//app.use('/cart', cartRouter); //Carrito
//app.use('/orders', ordersRouter); //Ordenes de compra

//APLICAR LIMITADOR ESTRICTO SOLO A AUTH
app.use('/auth', authLimiter, authRoutes);

app.use('/auth', authRoutes); //  LOGIN / REGISTER
app.use('/users', usersRoutes); // EDIT PROFILE; ETC
//app.use('/dashboard', dashboardRoutes); //Gestionar ordenes de compra ADMIN
//app.use('/addresses', addressRoutes); //Exigencia de dirección de envío
app.use('/categories', categoryRoutes); 
app.use('/form', customForm);
app.use('/settings', settingsRoutes);

app.use((req, res, next) => { // <--- Sin ruta, captura todo lo que sobra
  res.status(404).json({ error: `No se encontró la ruta ${req.originalUrl}` });
});

// MIDDLEWARE DE ERRORES (SIEMPRE AL FINAL)
app.use(errorHandler); // <--- 2. Usar

module.exports = app;


