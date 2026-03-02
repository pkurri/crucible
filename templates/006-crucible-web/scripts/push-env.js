const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.log('.env.local not found');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

const vars = [];
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  
  const splitIdx = trimmed.indexOf('=');
  if (splitIdx === -1) continue;
  
  const key = trimmed.substring(0, splitIdx).trim();
  let value = trimmed.substring(splitIdx + 1).trim();
  
  // Remove inline comments
  if (value.includes('#') && !value.includes('AIzaSy') && !value.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
     const p = value.split(' #');
     if(p.length > 1) value = p[0].trim();
  }
  
  vars.push({ key, value });
}

console.log(`Found ${vars.length} variables. Ready to push...`);

const { exec } = require('child_process');

// ...
function pushEnv(key, value) {
  return new Promise((resolve) => {
    console.log(`Pushing ${key}...`);
    const child = exec(`npx vercel env add ${key} production`, {
      cwd: path.join(__dirname, '..'),
    });

    child.stdout.on('data', () => {});
    child.stderr.on('data', (err) => { console.error(`[${key}] ${err}`); });

    child.stdin.write(value + '\n');
    child.stdin.end();

    child.on('close', (code) => {
      console.log(`[${key}] Exited with code ${code}`);
      resolve(code === 0);
    });
  });
}

async function main() {
  for (const v of vars) {
    if(!v.key) continue;
    await pushEnv(v.key, v.value);
  }
  console.log('All variables processed.');
}

main();
