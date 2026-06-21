const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Criar pool de conexões
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'automatic_correction',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Promisify para usar async/await
const promisePool = pool.promise();

module.exports = {
    pool,
    promisePool,
    query: (sql, params) => promisePool.query(sql, params)
};