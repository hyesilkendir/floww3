require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSeedData() {
  let connection;
  
  try {
    console.log('🌱 Starting seed data process...');
    
    // Connect to database with UTF-8
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT),
      charset: 'utf8mb4',
    });

    console.log('✅ Connected to MySQL database with UTF-8');

    // Read seed data file
    const migrationsDir = path.join(__dirname, 'src/lib/db/migrations');
    const seedFile = '0002_seed_data.sql';
    const filePath = path.join(migrationsDir, seedFile);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split statements and filter
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        const cleaned = stmt.replace(/^--> statement-breakpoint\s*/gm, '').trim();
        
        // For multi-line statements, check if any line contains SQL keywords
        const lines = cleaned.split('\n');
        const hasSQL = lines.some(line => {
          const trimmedLine = line.trim();
          return !trimmedLine.startsWith('--') && 
                 (trimmedLine.toUpperCase().includes('CREATE') || 
                  trimmedLine.toUpperCase().includes('INSERT') || 
                  trimmedLine.toUpperCase().includes('ALTER'));
        });
        
        return cleaned.length > 0 && hasSQL;
      })
      .map(stmt => stmt.replace(/^--> statement-breakpoint\s*/gm, '').trim());

    console.log(`📝 Found ${statements.length} seed statements`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && statement.length > 0) {
        try {
          // Clean up the statement
          const cleanStatement = statement.replace(/-- statement-breakpoint/g, '').trim();
          if (cleanStatement.length > 0) {
            console.log(`🔄 Executing statement ${i + 1}/${statements.length}:`);
            console.log(`   ${cleanStatement.substring(0, 80)}...`);
            
            await connection.execute(cleanStatement);
            console.log(`✅ Success`);
          }
        } catch (error) {
          if (error.message.includes('Duplicate entry')) {
            console.log(`⚠️  Warning: ${error.message.substring(0, 100)}...`);
          } else {
            console.log(`❌ Error: ${error.message}`);
          }
        }
      }
    }

    console.log('🎉 Seed data completed!');

  } catch (error) {
    console.error('💥 Seed data failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📤 Database connection closed');
    }
  }
}

runSeedData();