const pool = require('../db');

// Agregamos 'phone' al insert
const create = async ({ userId, street, city, state, zipCode, country, phone }) => {
  const result = await pool.query(
    `INSERT INTO addresses (user_id, street, city, state, zip_code, country, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, street, city, state, zipCode, country, phone]
  );
  return result.rows[0];
};

const findAllByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query('SELECT * FROM addresses WHERE id = $1', [id]);
  return result.rows[0];
};

const deleteById = async (id) => {
  const result = await pool.query('DELETE FROM addresses WHERE id = $1', [id]);
  return result.rowCount > 0;
};

module.exports = { create, findAllByUserId, findById, deleteById };