const pool = require('../db/index.js');

//Crea el formulario 
const createForm = async(userId, fullName, contactInfo, description, imageUrl) => {
    const db = pool;

    const result = await db.query(
    `INSERT INTO custom_requests (user_id, full_name, contact_info, description, image_url) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [userId, fullName, contactInfo, description, imageUrl] 
  );

  return result.rows[0];
}

const getAllForms = async () => {
  const result = await pool.query('SELECT * FROM custom_requests ORDER BY created_at DESC');
  return result.rows;
};


module.exports={
    createForm,
    getAllForms
};


