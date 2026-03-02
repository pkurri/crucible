const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..', '..');

function parseSkills() {
  const content = fs.readFileSync(path.join(rootDir, 'skills', 'CATALOG.md'), 'utf-8');
  const lines = content.split('\n');
  const skills = [];
  let currentCategory = '';

  for (const line of lines) {
    if (line.startsWith('### ')) {
      currentCategory = line.replace('### ', '').replace(/\(\d+ skills\)/, '').trim().split(' ')[1] || line.replace('### ', '').replace(/\(\d+ skills\)/, '').trim();
      const cleanCat = line.replace('###', '').trim();
      const match = cleanCat.match(/(?:.*?\s)?([\w\s&]+?)(?:\s\(\d+ skills\))?$/);
      if (match) {
        currentCategory = match[1].trim();
      }
    } else if (line.startsWith('**') && line.includes('** - ')) {
      const parts = line.split('** - ');
      const id = parts[0].replace('**', '').trim();
      const desc = parts[1].trim();
      skills.push({
        id,
        name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: desc,
        category: currentCategory,
        triggers: [id.replace(/-/g, ' ')]
      });
    }
  }
  
  fs.mkdirSync(path.join(__dirname, '..', 'src', 'data'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'skills.json'), JSON.stringify(skills, null, 2));
  console.log(`Parsed ${skills.length} skills.`);
}

function parseTemplates() {
  const content = fs.readFileSync(path.join(rootDir, 'templates', 'CATALOG.md'), 'utf-8');
  const lines = content.split('\n');
  const templates = [];
  let currentCategory = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      const cleanCat = line.replace('###', '').trim();
      const match = cleanCat.match(/(?:.*?\s)?([\w\s&/]+?)(?:\s\(\d+ templates\))?$/);
      if (match) {
        currentCategory = match[1].trim();
      }
    } else if (line.startsWith('**') && !line.includes('** - ') && line.match(/\*\*\d{3}-/)) {
      const nameLine = line.replace(/\*\*/g, '').trim();
      const number = nameLine.substring(0, 3);
      const name = nameLine.substring(4).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const descLine = (lines[i+1] || '').trim();
      
      templates.push({
        number,
        name,
        category: currentCategory,
        description: descLine
      });
    }
  }
  
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'templates.json'), JSON.stringify(templates, null, 2));
  console.log(`Parsed ${templates.length} templates.`);
}

parseSkills();
parseTemplates();
