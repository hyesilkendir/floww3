require('dotenv').config();
const fs = require('fs');
const path = require('path');

function debugSeedData() {
  const migrationsDir = path.join(__dirname, 'src/lib/db/migrations');
  const file = '0002_seed_data.sql';
  const filePath = path.join(migrationsDir, file);
  
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  
  console.log('📄 Seed file size:', sqlContent.length, 'characters');
  console.log('📝 First 300 characters:');
  console.log(sqlContent.substring(0, 300));
  
  // Split by semicolon
  const parts = sqlContent.split(';');
  console.log('\n🔧 Split by semicolon:', parts.length, 'parts');
  
  parts.forEach((part, i) => {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      console.log(`   Part ${i}: "${trimmed.substring(0, 80)}..." (${trimmed.length} chars)`);
    }
  });
  
  // Test our filter
  console.log('\n🔍 Testing UPDATED filter logic:');
  const filteredStatements = parts
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
      
      if (cleaned.length > 0) {
        console.log(`   Testing: "${cleaned.substring(0, 50)}..." -> ${hasSQL}`);
        if (hasSQL) {
          const sqlLine = lines.find(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('--') && 
                   (trimmed.toUpperCase().includes('INSERT') || 
                    trimmed.toUpperCase().includes('CREATE') || 
                    trimmed.toUpperCase().includes('ALTER'));
          });
          console.log(`     Found SQL in: ${sqlLine?.trim()}`);
        }
      }
      
      return cleaned.length > 0 && hasSQL;
    })
    .map(stmt => stmt.replace(/^--> statement-breakpoint\s*/gm, '').trim());
  
  console.log('\n✅ Final filtered statements:', filteredStatements.length);
  filteredStatements.forEach((stmt, i) => {
    console.log(`   ${i}: ${stmt.substring(0, 80)}...`);
  });
}

debugSeedData();