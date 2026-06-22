const { Pool } = require('pg');

const pool = new Pool({
    /*host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME*/

    connectionString: process.env.DATABASE_URL,
    
    // Agregamos esto para que la conexión a la nube sea segura (Neon lo requiere)
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;