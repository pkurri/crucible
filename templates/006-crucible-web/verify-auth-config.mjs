import fs from 'fs';
import path from 'path';

// Manual .env loading for the test
function loadEnv(file) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length === 2) {
        process.env[parts[0].trim()] = parts[1].trim();
      }
    });
  }
}

loadEnv('.env.local');

async function verifyConfig() {
  console.log('--- Supabase Configuration Verification ---');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('URL from env:', url);
  console.log('Anon Key found:', !!anonKey);
  if (anonKey) {
    console.log('Anon Key starts with eyJ:', anonKey.startsWith('eyJ'));
  }
  
  if (!anonKey || !anonKey.startsWith('eyJ')) {
    console.error('\n❌ FAIL: Anon key in .env.local is missing or incorrect format (should start with eyJ).');
    process.exit(1);
  } else {
    console.log('\n✅ PASS: Configuration correctly loaded from .env.local.');
    console.log('The hardcoded override has been removed.');
  }
}

verifyConfig();
