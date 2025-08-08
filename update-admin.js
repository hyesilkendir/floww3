require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT),
      charset: 'utf8mb4',
    });

    console.log('🔄 Updating admin user credentials...');

    // Update admin user password
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      ['532d7315', 'admin-user-1']
    );

    console.log('✅ Admin user updated successfully!');
    console.log('📝 New credentials:');
    console.log('   Username: admin');
    console.log('   Password: 532d7315');

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateAdmin();