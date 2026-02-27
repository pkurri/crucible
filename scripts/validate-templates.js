#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../templates');

function validateTemplate(templateDir) {
  const readmePath = path.join(templateDir, 'README.md');
  const envExamplePath = path.join(templateDir, '.env.example');

  if (!fs.existsSync(readmePath)) {
    throw new Error('Missing README.md');
  }

  if (!fs.existsSync(envExamplePath)) {
    throw new Error('Missing .env.example');
  }

  // Check if package.json exists and is valid
  const packageJsonPath = path.join(templateDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid package.json: ${error.message}`);
    }
  }

  return true;
}

function main() {
  let failed = 0;

  if (!fs.existsSync(templatesDir)) {
    console.error('❌ templates directory not found');
    process.exit(1);
  }

  const templateDirs = fs.readdirSync(templatesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`🔍 Validating ${templateDirs.length} templates...`);

  for (const templateDir of templateDirs) {
    const fullPath = path.join(templatesDir, templateDir);
    
    try {
      validateTemplate(fullPath);
      console.log(`✅ ${templateDir}`);
    } catch (error) {
      console.error(`❌ ${templateDir}: ${error.message}`);
      failed++;
    }
  }

  if (failed > 0) {
    console.error(`\n❌ ${failed} template(s) failed validation`);
    process.exit(1);
  }

  console.log(`\n✅ All ${templateDirs.length} templates passed validation`);
}

if (require.main === module) {
  main();
}

module.exports = { validateTemplate };
