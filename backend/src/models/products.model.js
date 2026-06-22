// backend/src/models/products.model.js
const pool = require('../db/index.js');

const findAll = async ({ 
  minPrice, maxPrice, sort = 'price', order = 'ASC', 
  limit = 10, offset = 0, 
  search,       
  category_id,
  category,
  featured
}) => {
  // 👇 CAMBIO 1: Usamos 'p.is_active' en lugar de solo 'is_active'
  // Antes: let whereClauses = ['p.is_active = true'];
  let whereClauses = [];
  let values = [];
  let paramIndex = 1;

  // 👇 CAMBIO 2: Agregamos 'p.' a price también por seguridad, sino se lo confunde con categories
  if (minPrice) { whereClauses.push(`p.price >= $${paramIndex++}`); values.push(minPrice); }
  if (maxPrice) { whereClauses.push(`p.price <= $${paramIndex++}`); values.push(maxPrice); }

  // 👇 CAMBIO CRÍTICO: Usamos 'p.name' y 'p.description'
  // Esto arregla el error de "columna ambigua"
  if (search) {
      whereClauses.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
  }

  if (category_id  || category) {
      whereClauses.push(`p.category_id = $${paramIndex++}`); values.push(category_id);
  }

  // --- NUEVO FILTRO: FEATURED ---
  if (featured === 'true') {
    whereClauses.push('p.is_featured = true');
  }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const dataQuery = `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereSQL}
    ORDER BY p.${sort} ${order}
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `;

  const countQuery = `
    SELECT COUNT(*) 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereSQL}
  `;
  
  const totalResult = await pool.query(countQuery, values);
  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

  return { total: Number(totalResult.rows[0].count), results: dataResult.rows };
};

const findById = async (id) => {
  // 👇 FIX 1: Agregamos explícitamente is_active e is_featured al SELECT
  const result = await pool.query(
    `SELECT id, name, description, price, stock, track_stock, image_url, category_id, is_active, is_featured 
     FROM products WHERE id = $1`, 
    [id]
  );
  return result.rows[0];
};

const create = async ({ 
  name, description, price, stock, track_stock, image_url, category_id, 
  is_active, is_featured 
}) => {
  
  // 🛡️ BLINDAJE DE DATOS: Si no llegan, ponemos valores por defecto
  const finalStock = (stock === undefined || stock === null || stock === '') ? 0 : stock;
  const finalActive = is_active !== undefined ? is_active : true; // Por defecto activo
  const finalFeatured = is_featured !== undefined ? is_featured : false; // Por defecto no destacado

  const result = await pool.query(
    `INSERT INTO products (
      name, description, price, stock, track_stock, image_url, category_id, is_active, is_featured
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
    [
      name, 
      description, 
      price, 
      finalStock, // 👈 Ahora nunca será null
      track_stock || false, 
      image_url, 
      category_id,
      finalActive,
      finalFeatured
    ]
  );
  return result.rows[0];
};

const update = async (id, currentData, newData) => {
  // 👇 FIX 2: Preparación de variables "A prueba de balas"
  // Si newData tiene el valor, úsalo. Si no, usa currentData. Si ambos fallan, usa un valor por defecto seguro.
  
  // Para is_active: Si llega undefined en ambos, asumimos TRUE (para que no se desactive solo)
  const finalIsActive = newData.is_active !== undefined 
    ? newData.is_active 
    : (currentData.is_active !== undefined ? currentData.is_active : true);

  // Para is_featured: Si llega undefined en ambos, asumimos FALSE
  const finalIsFeatured = newData.is_featured !== undefined 
    ? newData.is_featured 
    : (currentData.is_featured !== undefined ? currentData.is_featured : false);

  const { name, description, price, stock, track_stock, image_url, category_id } = newData;
  const newTrackStock = track_stock ?? currentData.track_stock;

  const result = await pool.query(
    `UPDATE products SET
      name = $1, 
      description = $2,
      price = $3, 
      stock = $4, 
      track_stock = $5,
      image_url = $6,
      category_id = $7,
      is_active = $8,
      is_featured = $9
     WHERE id = $10
     RETURNING *`,
    [
      name ?? currentData.name,
      description ?? currentData.description,
      price ?? currentData.price,
      newTrackStock ? (stock ?? currentData.stock) : null,
      newTrackStock,
      image_url ?? currentData.image_url,
      category_id ?? currentData.category_id,
      finalIsActive,   // 👈 Ahora es imposible que sea null
      finalIsFeatured, // 👈 Ahora es imposible que sea null
      id
    ]
  );
  return result.rows[0];
};

const deleteById = async (id) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return result.rowCount > 0;
};

const decreaseStock = async (id, quantity, client) => {
  const db = client || pool; 
  await db.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, id]);
};

module.exports = { findAll, findById, create, update, deleteById, decreaseStock };