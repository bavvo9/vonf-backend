const pool = require('../db/index.js');

// 1. Estadísticas Generales (Tarjetas de arriba)
const getGeneralStats = async () => {
  // Hacemos 3 consultas en paralelo para ser eficientes
  const usersQuery = pool.query('SELECT COUNT(*) FROM users'); //Cuenta cant de usuarios
  const ordersQuery = pool.query('SELECT COUNT(*) FROM orders'); 
  // Sumamos el total de ventas (Ojo: en el futuro filtraremos por status = 'paid')
  const revenueQuery = pool.query('SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders');

  const [users, orders, revenue] = await Promise.all([usersQuery, ordersQuery, revenueQuery]);

  return {
    totalUsers: Number(users.rows[0].count),
    totalOrders: Number(orders.rows[0].count),
    totalRevenue: Number(revenue.rows[0].total_revenue)
  };
};

// 2. Productos Más Vendidos (Top 5)
const getTopProducts = async () => {
  const query = `
    SELECT 
      p.id, 
      p.name, 
      p.image_url,
      CAST(SUM(oi.quantity) AS INTEGER) as total_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.id, p.name, p.image_url
    ORDER BY total_sold DESC
    LIMIT 5
  `;
  const result = await pool.query(query);
  return result.rows;
};

// 3. Alerta de Stock Bajo (Menos de 5 unidades)
const getLowStockProducts = async () => {
  const query = `
    SELECT id, name, stock, image_url 
    FROM products 
    WHERE track_stock = true AND stock < 5
    ORDER BY stock ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getGeneralStats,
  getTopProducts,
  getLowStockProducts
};