const pool = require('../db/index.js');
const { initialStatus } = require('../constants/orderTransitions');

// 1. Crear Orden (Corregido para recibir 'client' y usar la columna 'total')
const createOrder = async (total, userId, addressId, paymentMethod, client) => {
  const db = client || pool;


  const result = await db.query(
    `INSERT INTO orders (user_id, total, status, address_id, payment_method) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [userId, total, initialStatus, addressId, paymentMethod] 
  );
  
  return result.rows[0];
};

// 2. Crear Item de Orden (Se mantiene igual, funciona bien)
const createOrderItem = async ({ orderId, productId, name, price, quantity }, client) => {
  const db = client || pool;
  await db.query(
    `INSERT INTO order_items (order_id, product_id, name, price, quantity, subtotal)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [orderId, productId, name, price, quantity, price * quantity]
  );
};

const findById = async (id) => {
  // 1. Datos de la orden + Usuario
  const orderRes = await pool.query(
    `SELECT o.*, u.email, u.first_name, u.last_name 
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.id = $1`,
    [id]
  );
  
  if (orderRes.rows.length === 0) return null;
  const order = orderRes.rows[0];

  // 2. Items de la orden
  const itemsRes = await pool.query(
    `SELECT oi.*, p.name as product_name, p.image_url 
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [id]
  );

  // 3. Unimos todo
  order.items = itemsRes.rows;
  return order;
};

//PARA EL DETALLE (Modal): Agregamos Address y Payment
const findByUuid = async (uuid) => {
  // 1. Buscar orden + Usuario + DIRECCIÓN (Nuevo JOIN)
  const result = await pool.query(
    `SELECT 
      o.*, 
      u.email, u.first_name, u.last_name,
      a.street, a.city, a.state, a.zip_code, a.phone
     FROM orders o
     JOIN users u ON o.user_id = u.id
     LEFT JOIN addresses a ON o.address_id = a.id
     WHERE o.uuid = $1`,
    [uuid]
  );
  
  const order = result.rows[0];
  if (!order) return null;

  // 2. Buscar items (Igual que antes)
  const itemsRes = await pool.query(
    `SELECT oi.*, p.name as product_name, p.image_url
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [order.id]
  );

  order.items = itemsRes.rows;
  return order;
};

const findAll = async () => {
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return result.rows;
};

// 👇 NUEVA FUNCIÓN: Solo para el Admin (Trae datos del usuario)
const findAllWithDetails = async () => {
  const result = await pool.query(
    `SELECT 
      o.id, o.total, o.status, o.created_at, o.uuid, o.payment_method,
      u.email, u.first_name, u.last_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC`
  );
  return result.rows;
};

const findByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const updateStatus = async (id, status, client) => {
  const db = client || pool;
  const result = await db.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

const logStatusHistory = async ({ orderId, previousStatus, newStatus, changedBy, role }, client) => {
  const db = client || pool;
  await db.query(
    `INSERT INTO order_status_history 
    (order_id, previous_status, new_status, changed_by, changed_by_role)
    VALUES ($1, $2, $3, $4, $5)`,
    [orderId, previousStatus, newStatus, changedBy, role]
  );
};

const getHistory = async (orderId) => {
  const result = await pool.query(
    `SELECT previous_status, new_status, changed_by, changed_by_role, created_at
     FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
    [orderId]
  );
  return result.rows;
};

module.exports = {
  createOrder,
  createOrderItem,
  findById,
  findAll,
  findByUserId,
  updateStatus,
  logStatusHistory,
  getHistory, 
  findByUuid,
  findAllWithDetails
};