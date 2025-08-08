require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testMigration() {
  try {
    console.log('🔄 Testing migration script...');
    
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT),
      multipleStatements: true,
    });

    console.log('✅ Connected to database');

    // Check migrations directory
    const migrationsDir = path.join(__dirname, 'src/lib/db/migrations');
    console.log('📁 Migrations directory:', migrationsDir);
    
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📄 Found ${files.length} migration files:`, files);

    // Test reading one migration file
    if (files.length > 0) {
      const firstFile = files[0];
      const filePath = path.join(migrationsDir, firstFile);
      const content = fs.readFileSync(filePath, 'utf8');
      
      console.log(`📖 Reading ${firstFile}:`);
      console.log(`   Size: ${content.length} characters`);
      console.log(`   First 100 characters: ${content.substring(0, 100)}...`);
    }

    await connection.end();
    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMigration();