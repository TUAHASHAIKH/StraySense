const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '0305',
      database: 'straysense'
    });
    
    console.log('Successfully connected to MySQL!');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM animals');
    console.log('Number of animals:', rows[0].count);
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection(); 