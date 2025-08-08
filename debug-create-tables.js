require('dotenv').config();
const fs = require('fs');
const path = require('path');

function debugCreateTables() {
  const migrationsDir = path.join(__dirname, 'src/lib/db/migrations');
  const file = '0000_sharp_ogun.sql';
  const filePath = path.join(migrationsDir, file);
  
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  
  console.log('🔍 Analyzing CREATE TABLE statements...');
  
  // Split by semicolon
  const parts = sqlContent.split(';');
  console.log('Total parts after split by semicolon:', parts.length);
  
  // Find CREATE TABLE statements
  const createTables = parts
    .map((stmt, i) => ({ index: i, statement: stmt.trim() }))
    .filter(({ statement }) => statement.toUpperCase().includes('CREATE TABLE'));
  
  console.log('\n📊 Found CREATE TABLE statements:');
  createTables.forEach(({ index, statement }) => {
    const tableName = statement.match(/CREATE TABLE `(\w+)`/);
    console.log(`   ${index}: ${tableName ? tableName[1] : 'UNKNOWN'} - ${statement.substring(0, 60)}...`);
  });
  
  // Also check the filtering logic we use in migration
  console.log('\n🔧 Testing our NEW filter logic:');
  const filteredStatements = parts
    .map(stmt => stmt.trim())
    .filter(stmt => {
      const cleaned = stmt.replace(/^--> statement-breakpoint\s*/gm, '').trim();
      return cleaned.length > 0 && 
             !cleaned.startsWith('--') &&
             (cleaned.toUpperCase().includes('CREATE') || 
              cleaned.toUpperCase().includes('INSERT') || 
              cleaned.toUpperCase().includes('ALTER'));
    })
    .map(stmt => stmt.replace(/^--> statement-breakpoint\s*/gm, '').trim());
  
  console.log('Statements after filtering:', filteredStatements.length);
  
  filteredStatements.forEach((stmt, i) => {
    if (stmt.toUpperCase().includes('CREATE TABLE')) {
      const tableName = stmt.match(/CREATE TABLE `(\w+)`/);
      console.log(`   ${i}: CREATE TABLE ${tableName ? tableName[1] : 'UNKNOWN'}`);
    }
  });
  
  // Check for potential issues
  console.log('\n⚠️  Potential issues:');
  const longStatements = filteredStatements.filter(stmt => stmt.length > 1000);
  console.log('Very long statements (might be incomplete):', longStatements.length);
  
  if (longStatements.length > 0) {
    console.log('First long statement length:', longStatements[0].length);
    console.log('First 100 chars:', longStatements[0].substring(0, 100));
    console.log('Last 100 chars:', longStatements[0].substring(longStatements[0].length - 100));
  }
}

debugCreateTables();