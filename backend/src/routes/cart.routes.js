const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

//Importar las funciones del controlador
const {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    syncCart,
    clearCart
} = require('../controllers/cart.controller');

router.use(authMiddleware);

//Adecúa la función según la solicitud https
router.get('/', getCart);
router.post('/', addToCart);
router.post('/sync', syncCart); // 👈 Ruta nueva para fusionar
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', authMiddleware, clearCart);


module.exports = router;
