const pool = require('../db/index.js');

const findAll = async () => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

const create = async (name, description) => {
  const result = await pool.query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  );
  return result.rows[0];
};

module.exports = { findAll, create };