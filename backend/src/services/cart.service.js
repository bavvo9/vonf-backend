const CartModel = require('../models/cart.model');
const ProductModel = require('../models/products.model');
const AppError = require('../utils/appError');
const pool = require('../db/index.js');

const getCart = async (userId) => {
  const items = await CartModel.getCartItems(userId);
  return items; 
};

const addToCart = async (userId, productId, quantity) => {
  const product = await ProductModel.findById(productId);
  if (!product) throw new AppError('Producto no encontrado', 404);

  const existingItem = await CartModel.findOne(userId, productId);
  
  // 👇 FIX CRÍTICO: Forzamos conversión a Número
  const qtyToAdd = Number(quantity);
  const currentQty = existingItem ? Number(existingItem.quantity) : 0;
  const stockAvailable = Number(product.stock);

  // Verificación estricta
  if (product.track_stock && (currentQty + qtyToAdd > stockAvailable)) {
    throw new AppError(`Stock insuficiente. Máximo disponible: ${stockAvailable}`, 400);
  }

  if (existingItem) {
    await CartModel.update(userId, productId, currentQty + qtyToAdd);
  } else {
    await CartModel.create(userId, productId, qtyToAdd);
  }
};

const syncCart = async (userId, localItems) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log(`Sincronizando carrito para usuario ${userId}. Items:`, localItems.length);

    for (const item of localItems) {
      const productId = item.id || item.product_id; 
      // 👇 FIX: Número
      const quantityToAdd = Number(item.quantity);

      const product = await ProductModel.findById(productId);
      if (!product) continue; 

      const existingItem = await CartModel.findOne(userId, productId, client);
      const stockAvailable = Number(product.stock);
      
      if (existingItem) {
        let newQty = Number(existingItem.quantity) + quantityToAdd;
        // Respetar tope de stock
        if (product.track_stock && newQty > stockAvailable) newQty = stockAvailable; 
        await CartModel.update(userId, productId, newQty, client);
      } else {
        let newQty = quantityToAdd;
        if (product.track_stock && newQty > stockAvailable) newQty = stockAvailable;
        await CartModel.create(userId, productId, newQty, client);
      }
    }

    await client.query('COMMIT');
    return await CartModel.getCartItems(userId);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en syncCart:", error);
    throw error;
  } finally {
    client.release();
  }
};

const updateItem = async (userId, productId, quantity) => {
  const product = await ProductModel.findById(productId);
  if (!product) throw new AppError('Producto no encontrado', 404);

  // 👇 FIX: Número
  const qty = Number(quantity);
  const stockAvailable = Number(product.stock);

  if (product.track_stock && qty > stockAvailable) {
    throw new AppError(`Stock insuficiente. Disponible: ${stockAvailable}`, 400);
  }
  
  const existing = await CartModel.findOne(userId, productId);
  if (!existing) throw new AppError('Producto no está en el carrito', 404);

  await CartModel.update(userId, productId, qty);
};

const removeItem = async (productId) => {
  const deleted = await CartModel.removeItem(productId);
  if (!deleted) throw new AppError('Producto no encontrado en carrito', 404);
};

const clearCart = async (userId) => {
  await CartModel.clearCart(userId);
  return []; // Retornamos array vacío para actualizar el frontend
};

module.exports = { getCart, syncCart, addToCart, updateItem, removeItem, clearCart };