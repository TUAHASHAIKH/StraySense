import mysql from 'mysql2';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'tuaha486486',
    database: 'straysense'
}).promise();

export default pool;