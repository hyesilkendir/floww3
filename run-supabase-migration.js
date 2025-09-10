require('dotenv').config();
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function runSupabaseMigrations() {
  let sql;
  
  try {
    console.log('🚀 Starting Supabase migration process...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    // Connect to database
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });

    console.log('✅ Connected to Supabase/PostgreSQL database');

    // Get migration files
    const migrationsDir = path.join(__dirname, 'src/lib/db/pg-migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 PostgreSQL migrations directory not found, skipping migrations');
      return;
    }
    
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files`);

    // Execute each migration
    for (const file of files) {
      console.log(`🔄 Running migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      try {
        // Execute the entire SQL file content
        await sql.unsafe(sqlContent);
        console.log(`✅ Completed migration: ${file}`);
      } catch (error) {
        // Some errors might be expected (like table already exists)
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  Warning in ${file}: ${error.message.substring(0, 100)}...`);
        } else {
          console.log(`❌ Error in ${file}: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('🎉 All Supabase migrations completed successfully!');

  } catch (error) {
    console.error('💥 Supabase migration failed:', error);
    throw error;
  } finally {
    if (sql) {
      await sql.end();
      console.log('📤 Database connection closed');
    }
  }
}

runSupabaseMigrations().catch(console.error);
