const CartService = require('../services/cart.service');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await CartService.getCart(userId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const syncCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // El carrito local (array)

    // Llamamos a la fusión
    const cart = await CartService.syncCart(userId, items || []);
    
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    await CartService.addToCart(userId, product_id, quantity);
    res.status(201).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    await CartService.updateItem(userId, productId, quantity);
    res.json({ message: 'Cantidad actualizada' });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await CartService.removeItem(productId);
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await CartService.clearCart(userId);
    res.status(200).json([]); // Respondemos con carrito vacío
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, syncCart, addToCart, removeFromCart, updateCartItem, clearCart };