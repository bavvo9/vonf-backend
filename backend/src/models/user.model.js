const pool = require('../db/index.js');

//Explicito, extrae user dado email
const findByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );
  return result.rows[0];
};

//Extrae user dado id
const findById = async (id) => {
  const result = await pool.query(
    `
    SELECT id, email, role, is_verified, first_name, last_name, created_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0];
};


const findByIdWithPassword = async (id) => {
  const result = await pool.query(
    `
    SELECT id, email, role, password_hash 
    FROM users
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0];
};

//crea user dado email, el password, token de verificacion y fecha de venc
const createUser = async ({
  email,
  passwordHash,
  verificationToken,
  expires,
  firstName, // Nuevo
  lastName   // Nuevo
}) => {
  const result = await pool.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      email_verification_token,
      email_verification_expires,
      first_name,
      last_name
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, first_name, last_name
    `,
    [email, passwordHash, verificationToken, expires, firstName, lastName]
  );

  return result.rows[0];
};

//Al hacer login, se actualiza el refresh token en caso en que esté vencido
const updateRefreshToken = async (userId, refreshToken) => {
  await pool.query(
    `
    UPDATE users
    SET refresh_token = $1
    WHERE id = $2
    `,
    [refreshToken, userId]
  );
};

//borra refresh token, para el logout más que nada
const clearRefreshToken = async (userId) => {
  await pool.query(
    `
    UPDATE users
    SET refresh_token = NULL
    WHERE id = $1
    `,
    [userId]
  );
};

//Dado el id, extrae el refresh token del usuario
const getRefreshToken = async (userId) =>{
    const result= await pool.query(
        `
        SELECT id, email, first_name, last_name, role, refresh_token 
        FROM users 
        WHERE id = $1
        `,
        [userId]
    )
    return result.rows[0];
}

//Verifica un email dado el token de verificaicon
const verifyEmailByToken = async (token) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      is_verified = true,
      email_verification_token = NULL,
      email_verification_expires = NULL
    WHERE email_verification_token = $1
      AND email_verification_expires > NOW()
    RETURNING id
    `,
    [token]
  );

  return result.rows[0];
};

const updateEmailVerificationToken = async (userId, token, expires) => {
  await pool.query(
    `
    UPDATE users
    SET email_verification_token = $1,
        email_verification_expires = $2
    WHERE id = $3
    `,
    [token,expires, userId]
  );
};

const updatePassword = async (userId, passwordHash) => {
  await pool.query(
    `
    UPDATE users
    SET password_hash = $1
    WHERE id = $2
    `,
    [passwordHash, userId]
  );
};

const findAll = async () => {
  const result = await pool.query(
    `SELECT id, email, first_name, last_name, role, is_verified, created_at 
     FROM users 
     ORDER BY created_at DESC`
  );
  return result.rows;
};


module.exports = {
  findByEmail,
  findById,
  createUser,
  updateRefreshToken,
  clearRefreshToken,
  verifyEmailByToken,
  getRefreshToken,
  updateEmailVerificationToken,
  updatePassword,
  findByIdWithPassword,
  findAll
};
