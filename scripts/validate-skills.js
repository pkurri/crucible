#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const skillsDir = path.join(__dirname, '../skills');

function validateSkill(skillPath) {
  const content = fs.readFileSync(skillPath, 'utf8');
  const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);

  if (!frontmatterMatch) {
    throw new Error(`No frontmatter found in ${skillPath}`);
  }

  let frontmatter;
  try {
    frontmatter = yaml.parse(frontmatterMatch[1]);
  } catch (error) {
    throw new Error(`Invalid YAML in ${skillPath}: ${error.message}`);
  }

  const required = ['name', 'description', 'triggers'];
  for (const field of required) {
    if (!frontmatter[field]) {
      throw new Error(`Missing required field '${field}' in ${skillPath}`);
    }
  }

  if (!Array.isArray(frontmatter.triggers) || frontmatter.triggers.length < 3) {
    throw new Error(`'triggers' must be an array with at least 3 items in ${skillPath}`);
  }

  if (typeof frontmatter.name !== 'string' || frontmatter.name.trim() === '') {
    throw new Error(`'name' must be a non-empty string in ${skillPath}`);
  }

  if (typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '') {
    throw new Error(`'description' must be a non-empty string in ${skillPath}`);
  }

  return true;
}

function main() {
  let failed = 0;

  if (!fs.existsSync(skillsDir)) {
    console.error('❌ skills directory not found');
    process.exit(1);
  }

  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`🔍 Validating ${skillDirs.length} skills...`);

  for (const skillDir of skillDirs) {
    const skillFile = path.join(skillsDir, skillDir, 'SKILL.md');
    
    try {
      if (!fs.existsSync(skillFile)) {
        console.error(`❌ Missing SKILL.md in ${skillDir}`);
        failed++;
        continue;
      }

      validateSkill(skillFile);
      console.log(`✅ ${skillDir}/SKILL.md`);
    } catch (error) {
      console.error(`❌ ${skillDir}/SKILL.md: ${error.message}`);
      failed++;
    }
  }

  if (failed > 0) {
    console.error(`\n❌ ${failed} skill(s) failed validation`);
    process.exit(1);
  }

  console.log(`\n✅ All ${skillDirs.length} skills passed validation`);
}

if (require.main === module) {
  main();
}

module.exports = { validateSkill };
