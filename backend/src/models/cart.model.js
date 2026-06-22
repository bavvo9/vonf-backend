const pool = require('../db/index.js');

// Obtener items del usuario
const getCartItems = async (userId) => {
  const result = await pool.query(`
    SELECT
      ci.product_id AS id,
      p.name,
      p.price,
      p.image_url,
      ci.quantity,
      p.stock::integer,     
      p.track_stock,
      (p.price * ci.quantity) AS subtotal
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = $1
  `, [userId]);

  console.log(result.rows);
  return result.rows; // Esto devuelve un ARRAY
};

const findItemByProductId = async (productId) => {
  const result = await pool.query('SELECT * FROM cart_items WHERE product_id = $1', [productId]);
  return result.rows[0];
};

// 👇 CORREGIDO: Usamos (client || pool) en lugar de getDb
const findOne = async (userId, productId, client) => {
  const db = client || pool;
  const result = await db.query(
    'SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  return result.rows[0];
};

// 👇 NUEVO: Requerido por syncCart
const create = async (userId, productId, quantity, client) => {
  const db = client || pool;
  await db.query(
    'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
    [userId, productId, quantity]
  );
};

// 👇 NUEVO: Requerido por syncCart
const update = async (userId, productId, quantity, client) => {
  const db = client || pool;
  await db.query(
    'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
    [quantity, userId, productId]
  );
};

// Funciones legacy
const addItem = async (productId, quantity) => {
  await pool.query(
    'INSERT INTO cart_items (product_id, quantity) VALUES ($1, $2)',
    [productId, quantity]
  );
};

const updateItemQuantity = async (productId, quantity) => {
  const result = await pool.query(
    'UPDATE cart_items SET quantity = $1 WHERE product_id = $2',
    [quantity, productId]
  );
  return result.rowCount > 0;
};

const removeItem = async (productId) => {
  const result = await pool.query('DELETE FROM cart_items WHERE product_id = $1', [productId]);
  return result.rowCount > 0;
};

const clearCart = async (userId, client) => {
  const db = client || pool;
  // Borra SOLO los items de este usuario
  await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
};

module.exports = { 
  getCartItems, 
  findItemByProductId, 
  addItem, 
  updateItemQuantity, 
  removeItem, 
  clearCart, 
  findOne, 
  create,
  update
};