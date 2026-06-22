const pool = require('../db/index.js');

const getAll = async () => {
  const result = await pool.query('SELECT * FROM site_settings ORDER BY key ASC');
  return result.rows;
};

const getByKey = async (key) => {
  const result = await pool.query('SELECT value FROM site_settings WHERE key = $1', [key]);
  return result.rows[0];
};

const update = async (key, value) => {
  const result = await pool.query(
    'UPDATE site_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2 RETURNING *',
    [value, key]
  );
  return result.rows[0];
};

module.exports = { getAll, getByKey, update };