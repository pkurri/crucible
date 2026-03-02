const fs = require('fs');
const path = require('path');

const templatesDir = path.join(process.cwd(), 'templates');
const dirs = fs.readdirSync(templatesDir).filter(d => d.match(/^0(3[1-9]|[4-9][0-9])-|^100-/));

console.log('Fixing nested directory structures...\n');

dirs.forEach(dir => {
  const fullPath = path.join(templatesDir, dir);
  const nestedPath = path.join(fullPath, dir);
  
  if (fs.existsSync(nestedPath) && fs.statSync(nestedPath).isDirectory()) {
    // Move files from nested directory to parent
    const files = fs.readdirSync(nestedPath);
    files.forEach(file => {
      const src = path.join(nestedPath, file);
      const dest = path.join(fullPath, file);
      if (!fs.existsSync(dest)) {
        fs.renameSync(src, dest);
      }
    });
    
    // Remove nested directory recursively
    fs.rmSync(nestedPath, { recursive: true, force: true });
    console.log(`Fixed: ${dir}`);
  }
});

console.log('\nDone!');
