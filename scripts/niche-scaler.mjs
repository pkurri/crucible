import fs from 'fs';
import path from 'path';

const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');

const CATEGORIES = [
  { name: 'Psychology', keywords: ['Subconscious', 'Body language', 'Dark traits', 'Brain waves'], emotion: 'Intrigue' },
  { name: 'TechFuturism', keywords: ['Neural link', 'Quantum computing', 'Mars colony', 'Androids'], emotion: 'Awe' },
  { name: 'FinanceAlpha', keywords: ['Compound interest', 'Crypto whales', 'Market manipulation', 'Wealth mindset'], emotion: 'Status' },
  { name: 'AncientWisdom', keywords: ['Samurai code', 'Stoic journal', 'Viking myths', 'Zen garden'], emotion: 'Respect' },
  { name: 'BiologyHacks', keywords: ['Cellular repair', 'Dopamine detox', 'Sleep protocol', 'Longevity'], emotion: 'Fascination' },
  { name: 'MysteryDeep', keywords: ['Lost cities', 'Unsolved signals', 'Deep sea anomalies', 'Artifacts'], emotion: 'Wonder' },
  { name: 'MechanicalASMR', keywords: ['Turbine engine', 'Watch clockwork', 'Liquid metal', 'Precision CNC'], emotion: 'Calm' }
];

const ADJECTIVES = ['Apex', 'Neural', 'Stellar', 'Primal', 'Cyber', 'Zen', 'Void', 'Nova', 'Pulse', 'Core', 'Shadow', 'Solar'];

function generate100Niches() {
  const registry = fs.existsSync(NICHES_FILE) ? JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8')) : { niches: [] };
  const existingNames = new Set(registry.niches.map(n => n.name));
  
  let count = 0;
  while (count < 100) {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const id = Math.floor(Math.random() * 1000);
    const name = `${adj}${cat.name}_${id}`;
    
    if (existingNames.has(name)) continue;
    
    registry.niches.push({
      name,
      platforms: ["meta", "youtube"],
      viralScore: (Math.random() * (9.9 - 8.5) + 8.5).toFixed(1),
      targetEmotion: cat.emotion,
      reason: `Automated expansion niche targeting ${cat.name} audience with high aesthetic retention.`,
      keywords: cat.keywords,
      voice: "en-US-GuyNeural",
      priority: false
    });
    
    existingNames.add(name);
    count++;
  }
  
  fs.writeFileSync(NICHES_FILE, JSON.stringify(registry, null, 2));
  console.log(`🚀 Empire Scaled: 100 new niches added to ${NICHES_FILE}`);
}

generate100Niches();
