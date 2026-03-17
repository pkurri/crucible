import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

async function getStatus(name, apiKey) {
  if (!apiKey) return 'no_key';
  try {
    const res = await fetch(`${MOLTBOOK_API}/agents/me`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await res.json();
    if (data.agent) {
      if (data.agent.is_claimed) return 'claimed';
      if (data.agent.is_active) return 'ready';
      return data.agent.status || 'pending_claim';
    }
    return data.status || 'unknown';
  } catch (e) {
    return 'error';
  }
}

async function main() {
  const registry = JSON.parse(readFileSync('scripts/agents/registry.json', 'utf-8'));
  const mainCreds = JSON.parse(readFileSync('scripts/moltbook-credentials.json', 'utf-8'));

  console.log('\n🦞 Crucible Moltbook Fleet Status Report');
  console.log('========================================================');
  console.log(`${'Agent Name'.padEnd(20)} | ${'Status'.padEnd(15)} | ${'Submolt'}`);
  console.log('--------------------------------------------------------');

  // Main Agent
  const mainStatus = await getStatus('CrucibleForge', mainCreds.api_key);
  console.log(`${'CrucibleForge'.padEnd(20)} | ${mainStatus.padEnd(15)} | m/forge-hq`);

  const BRAND_MAP = {
    DebtRadar: 'forge-burnrate',
    CVEWatcher: 'forge-sec',
    ArXivPulse: 'forge-research',
    DriftDetector: 'forge-drift',
    VCSignal: 'forge-vc',
    LegislAI: 'forge-policy',
    MicroSaaSRadar: 'forge-saas',
    EthicsBoard: 'forge-ethics',
    DevTrendMap: 'forge-trends',
    VisualArchitect: 'forge-graphics',
    RevenueOptimizer: 'forge-revenue',
    GrowthMarketeer: 'forge-growth',
    ORACLE: 'forge-gaming-trends',
    DOPAMINE: 'forge-neuro-gaming',
    GLITCH_MOD: 'forge-arcade-lobby',
    VANGUARD: 'forge-gaming-scouts',
    SENSORY: 'forge-game-juice',
    UA_PRO: 'forge-growth-engine'
  };

  for (const [name, submolt] of Object.entries(BRAND_MAP)) {
    if (name === 'CrucibleForge') continue; // Skip as it's the main header
    
    let actualName = name;
    let regData = registry[name];
    if (!regData && registry[`${name}_CF`]) {
      actualName = `${name}_CF`;
      regData = registry[actualName];
    }

    let status = 'ready (protocol)';
    let displayName = name;
    
    if (regData && regData.api_key) {
      status = await getStatus(actualName, regData.api_key);
      displayName = actualName;
    } else {
      // If no dedicated key, check if it's running via CrucibleForge
      displayName = `${name} (CF)`;
    }
    
    console.log(`${displayName.padEnd(20)} | ${status.padEnd(15)} | m/${submolt}`);
  }
  
  console.log('\n💡 Tip: To claim an agent, visit its claim_url in registry.json');
}

main();
