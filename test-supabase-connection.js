require('dotenv').config();
const postgres = require('postgres');

async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase/PostgreSQL connection...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    console.log('Database URL:', databaseUrl.replace(/:[^:@]*@/, ':****@')); // Hide password
    
    // Create connection
    const sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1, // Single connection for testing
    });

    console.log('✅ Successfully connected to Supabase/PostgreSQL!');
    
    // Test a simple query
    const result = await sql`SELECT version()`;
    console.log('✅ Database version:', result[0].version);
    
    // Test database name
    const dbInfo = await sql`SELECT current_database()`;
    console.log('✅ Connected to database:', dbInfo[0].current_database);
    
    // Close connection
    await sql.end();
    console.log('✅ Connection test completed successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

testSupabaseConnection();
