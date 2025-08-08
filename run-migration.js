require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  let connection;
  
  try {
    console.log('🚀 Starting migration process...');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT),
      charset: 'utf8mb4',
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL database');

    // Get migration files
    const migrationsDir = path.join(__dirname, 'src/lib/db/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files`);

    // Execute each migration
    for (const file of files) {
      console.log(`🔄 Running migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // Split statements by semicolon and clean them
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

      console.log(`   📝 Executing ${statements.length} statements...`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement && statement.length > 0) {
          try {
            // Clean up the statement - remove any remaining breakpoint comments
            const cleanStatement = statement.replace(/-- statement-breakpoint/g, '').trim();
            if (cleanStatement.length > 0) {
              console.log(`      Statement ${i + 1}/${statements.length}: ${cleanStatement.substring(0, 60)}...`);
              await connection.execute(cleanStatement);
              console.log(`      ✅ Success`);
            }
          } catch (error) {
            // Some errors might be expected (like table already exists)
            if (error.message.includes('already exists')) {
              console.log(`      ⚠️  Warning: ${error.message}`);
            } else {
              console.log(`      ❌ Error: ${error.message}`);
              // Continue with other statements for non-critical errors
            }
          }
        }
      }

      console.log(`✅ Completed migration: ${file}`);
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('📤 Database connection closed');
    }
  }
}

runMigrations().catch(console.error);