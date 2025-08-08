require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔄 Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USERNAME || 'root');
    console.log('Port:', process.env.DB_PORT || '3306');
    
    // First try to connect without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'Halil123.',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('✅ Successfully connected to MySQL server!');
    
    // Try to create database if it doesn't exist
    const dbName = process.env.DB_DATABASE || 'calafco_accounting';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' is ready`);
    
    // Test connection to specific database
    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ Successfully switched to database '${dbName}'`);
    
    await connection.end();
    console.log('✅ Connection test completed successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    return false;
  }
}

testConnection();