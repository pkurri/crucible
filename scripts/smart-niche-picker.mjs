#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🎯 SMART NICHE PICKER
 * Selects niches based on viral score, platform, and usage history
 * Prioritizes high viral scores and tracks usage to ensure variety
 */

const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');
const USAGE_TRACKER = path.join(process.cwd(), 'data', 'niche-usage-tracker.json');

function loadUsageTracker() {
  if (!fs.existsSync(USAGE_TRACKER)) {
    return { niches: {}, lastUpdated: new Date().toISOString() };
  }
  return JSON.parse(fs.readFileSync(USAGE_TRACKER, 'utf8'));
}

function saveUsageTracker(tracker) {
  tracker.lastUpdated = new Date().toISOString();
  fs.writeFileSync(USAGE_TRACKER, JSON.stringify(tracker, null, 2));
}

function calculateNicheScore(niche, usageTracker, platform) {
  const baseScore = niche.viralScore || 8.0;
  const usageData = usageTracker.niches[niche.name] || { totalUses: 0, platformUses: {}, lastUsed: null };
  
  // Penalties and bonuses
  let score = baseScore;
  
  // 1. Usage frequency penalty (more uses = lower priority)
  const totalUses = usageData.totalUses || 0;
  score -= (totalUses * 0.5); // -0.5 per use
  
  // 2. Platform-specific usage penalty
  const platformUses = usageData.platformUses?.[platform] || 0;
  score -= (platformUses * 1.0); // -1.0 per platform use
  
  // 3. Recent usage penalty (used in last 7 days)
  if (usageData.lastUsed) {
    const daysSinceUse = (Date.now() - new Date(usageData.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUse < 7) {
      score -= (7 - daysSinceUse) * 0.3; // Heavier penalty for recent use
    }
  }
  
  // 4. Priority bonus
  if (niche.priority === true) {
    score += 2.0;
  }
  
  // 5. Never-used bonus
  if (totalUses === 0) {
    score += 1.5;
  }
  
  return Math.max(0, score); // Never go negative
}

function pickTopNiches(platform, count = 5) {
  const registry = JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8'));
  const usageTracker = loadUsageTracker();
  
  // Filter by platform
  let niches = registry.niches.filter(n => n.platforms?.includes(platform));
  
  if (niches.length === 0) {
    // Fallback: all niches work on all platforms
    niches = registry.niches;
  }
  
  // Calculate scores
  const scoredNiches = niches.map(niche => ({
    ...niche,
    calculatedScore: calculateNicheScore(niche, usageTracker, platform)
  }));
  
  // Sort by calculated score (highest first)
  scoredNiches.sort((a, b) => b.calculatedScore - a.calculatedScore);
  
  // Return top N
  return scoredNiches.slice(0, count);
}

function markNicheAsUsed(nicheName, platform) {
  const usageTracker = loadUsageTracker();
  
  if (!usageTracker.niches[nicheName]) {
    usageTracker.niches[nicheName] = {
      totalUses: 0,
      platformUses: {},
      lastUsed: null,
      history: []
    };
  }
  
  const nicheData = usageTracker.niches[nicheName];
  nicheData.totalUses++;
  nicheData.platformUses[platform] = (nicheData.platformUses[platform] || 0) + 1;
  nicheData.lastUsed = new Date().toISOString();
  nicheData.history.push({
    date: new Date().toISOString(),
    platform: platform
  });
  
  saveUsageTracker(usageTracker);
  console.log(`✅ Tracked usage: ${nicheName} on ${platform} (Total uses: ${nicheData.totalUses})`);
}

function getUsageStats() {
  const usageTracker = loadUsageTracker();
  const stats = {
    totalNiches: Object.keys(usageTracker.niches).length,
    mostUsed: [],
    leastUsed: [],
    byPlatform: {}
  };
  
  const entries = Object.entries(usageTracker.niches);
  entries.sort((a, b) => b[1].totalUses - a[1].totalUses);
  
  stats.mostUsed = entries.slice(0, 5).map(([name, data]) => ({
    name,
    uses: data.totalUses,
    lastUsed: data.lastUsed
  }));
  
  stats.leastUsed = entries.slice(-5).reverse().map(([name, data]) => ({
    name,
    uses: data.totalUses,
    lastUsed: data.lastUsed
  }));
  
  return stats;
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'pick':
    const platform = args[1] || 'meta';
    const count = parseInt(args[2]) || 5;
    const topNiches = pickTopNiches(platform, count);
    
    console.log(`\n🎯 Top ${count} Niches for ${platform}:\n`);
    topNiches.forEach((n, i) => {
      console.log(`${i + 1}. ${n.name}`);
      console.log(`   Viral Score: ${n.viralScore}/10 | Calculated: ${n.calculatedScore.toFixed(2)}`);
      console.log(`   Emotion: ${n.targetEmotion} | Priority: ${n.priority ? '⭐' : '○'}`);
      console.log('');
    });
    
    // Output as JSON for scripting
    console.log('JSON_OUTPUT:', JSON.stringify(topNiches.map(n => n.name)));
    break;
    
  case 'mark':
    const nicheName = args[1];
    const usePlatform = args[2] || 'meta';
    if (!nicheName) {
      console.error('Usage: node smart-niche-picker.mjs mark <niche-name> [platform]');
      process.exit(1);
    }
    markNicheAsUsed(nicheName, usePlatform);
    break;
    
  case 'stats':
    const stats = getUsageStats();
    console.log('\n📊 Niche Usage Statistics\n');
    console.log(`Total tracked niches: ${stats.totalNiches}`);
    console.log('\nMost Used:');
    stats.mostUsed.forEach((n, i) => {
      console.log(`  ${i + 1}. ${n.name} - ${n.uses} uses (last: ${n.lastUsed?.split('T')[0] || 'N/A'})`);
    });
    console.log('\nLeast Used:');
    stats.leastUsed.forEach((n, i) => {
      console.log(`  ${i + 1}. ${n.name} - ${n.uses} uses (last: ${n.lastUsed?.split('T')[0] || 'N/A'})`);
    });
    break;
    
  default:
    console.log(`
🎯 Smart Niche Picker - Usage:

  node smart-niche-picker.mjs pick [platform] [count]
    Pick top niches prioritized by viral score and freshness
    Example: node smart-niche-picker.mjs pick meta 5
    
  node smart-niche-picker.mjs mark <niche-name> [platform]
    Mark a niche as used to update tracking
    Example: node smart-niche-picker.mjs mark SubliminalMastery meta
    
  node smart-niche-picker.mjs stats
    View usage statistics
    `);
}
