import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callLLM } from './lib/llm.mjs';
import { saveWorldToCloud, isCloudEnabled } from './lib/db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(process.cwd(), 'data', 'forge-worlds');

/**
 * 🔥 FORGE SIMULATOR — Multi-Agent Prediction Engine
 * 
 * 5-Stage Pipeline: SMELT → CAST → FORGE → ASSAY → INSPECT
 * 
 * Uses existing Crucible infra:
 *   - Gemini API (free 1500 req/day)
 *   - OpenRouter (free models for bulk agent chatter)
 *   - Local JSON storage (zero cost)
 *   - skill-memory.mjs for evolution tracking
 */

// ═══════════════════════════════════════════════════════════════════════
// STAGE 1: SMELT — Extract knowledge graph from seed data
// ═══════════════════════════════════════════════════════════════════════

async function smelt(oreInput) {
  console.log('⛏️  SMELT — Extracting knowledge from ore...');
  
  let seedText;
  if (typeof oreInput === 'string' && fs.existsSync(oreInput)) {
    seedText = fs.readFileSync(oreInput, 'utf8');
  } else if (typeof oreInput === 'string') {
    seedText = oreInput;
  } else {
    seedText = JSON.stringify(oreInput);
  }

  // Truncate to fit context window
  seedText = seedText.slice(0, 12000);

  const extraction = await callLLM(
    `You are an entity extraction engine. Analyze this data and extract:
     1. Key entities (people, companies, products, concepts)
     2. Relationships between entities
     3. Key facts and signals
     
     Data:
     ${seedText}
     
     Return ONLY valid JSON:
     {
       "entities": [{"name": "...", "type": "person|company|product|concept", "description": "..."}],
       "relationships": [{"from": "...", "to": "...", "type": "..."}],
       "facts": ["...", "..."]
     }`,
    { provider: 'gemini', json: true }
  );

  const worldId = `world_${Date.now()}`;
  console.log(`   ✅ Extracted ${extraction.entities?.length || 0} entities, ${extraction.relationships?.length || 0} relationships`);
  
  return { entities: extraction.entities || [], relationships: extraction.relationships || [], facts: extraction.facts || [], worldId };
}


// ═══════════════════════════════════════════════════════════════════════
// STAGE 2: CAST — Generate agent personas from archetypes
// ═══════════════════════════════════════════════════════════════════════

async function cast(smeltResult, config) {
  console.log('🔩 CAST — Generating agent personas...');
  
  // Load archetype template
  const domain = config.domain || 'generic';
  const templatePath = path.join(SKILL_ROOT, 'templates', 'archetypes', `${domain}.json`);
  const fallbackPath = path.join(SKILL_ROOT, 'templates', 'archetypes', 'generic.json');
  
  let archetypes;
  if (fs.existsSync(templatePath)) {
    archetypes = JSON.parse(fs.readFileSync(templatePath, 'utf8')).archetypes;
  } else {
    console.log(`   ⚠️ No template for "${domain}", using generic`);
    archetypes = JSON.parse(fs.readFileSync(fallbackPath, 'utf8')).archetypes;
  }

  const agents = [];
  const entityContext = smeltResult.entities.slice(0, 10).map(e => `${e.name} (${e.type})`).join(', ');
  
  for (const archetype of archetypes) {
    const count = config.agentCounts?.[archetype.role] || archetype.defaultCount;
    
    for (let i = 0; i < count; i++) {
      const persona = await callLLM(
        `Create a unique agent persona for a simulation.
         
         Role: ${archetype.label}
         Behavior: ${archetype.behavior_template}
         World context: ${entityContext}
         Traits: ${JSON.stringify(archetype.traits)}
         
         Make this persona #${i + 1} of ${count} — give them a unique name,
         specific personality, and concrete goals relevant to the world context.
         
         Return ONLY valid JSON:
         {
           "name": "unique realistic name",
           "personality": "2-3 sentence personality description",
           "goals": ["goal1", "goal2"],
           "biases": ["bias1"],
           "initial_opinion": "their starting position on the situation"
         }`,
        { provider: 'gemini', json: true }
      );

      agents.push({
        id: `${archetype.role}_${i}`,
        ...persona,
        archetype: archetype.role,
        traits: archetype.traits,
        memory: []
      });
    }
  }

  console.log(`   ✅ Cast ${agents.length} agents across ${archetypes.length} archetypes`);
  return { agents, graph: smeltResult, worldId: smeltResult.worldId };
}


// ═══════════════════════════════════════════════════════════════════════
// STAGE 3: FORGE — Run the multi-agent simulation
// ═══════════════════════════════════════════════════════════════════════

async function forge(castResult, scenario) {
  console.log(`🔥 FORGE — Running simulation (${scenario.rounds || 20} rounds, ${castResult.agents.length} agents)...`);
  
  const { agents } = castResult;
  const rounds = scenario.rounds || 20;
  const timeline = [];
  const startTime = Date.now();

  for (let round = 1; round <= rounds; round++) {
    const roundEvents = [];
    
    // Build situation summary from recent events
    const recentEvents = timeline.slice(-2).flatMap(r => 
      r.events.slice(0, 5).map(e => `${e.agentName}: ${e.action}`)
    ).join('\n');

    for (const agent of agents) {
      try {
        // Use OpenRouter FREE models for bulk agent actions
        const action = await callLLM(
          `You are ${agent.name}. ${agent.personality}
           Goals: ${(agent.goals || []).join(', ')}
           Current opinion: ${agent.initial_opinion || 'neutral'}
           
           Situation being simulated: "${scenario.question}"
           ${recentEvents ? `Recent events:\n${recentEvents}` : 'This is the first round.'}
           Your memory of past rounds: ${agent.memory.slice(-3).map(m => m.action).join('; ') || 'None yet'}
           
           What do you do or say this round? Be specific and in-character.
           
           Return ONLY valid JSON:
           {
             "action": "what you do (1-2 sentences)",
             "reasoning": "why (1 sentence)",
             "opinion_shift": "more positive|unchanged|more negative"
           }`,
          { provider: 'openrouter', json: true }
        );

        const event = {
          agentId: agent.id,
          agentName: agent.name || agent.id,
          archetype: agent.archetype,
          action: action.action || 'observes quietly',
          reasoning: action.reasoning || '',
          opinion_shift: action.opinion_shift || 'unchanged'
        };

        agent.memory.push({ round, action: event.action });
        roundEvents.push(event);
      } catch (err) {
        console.warn(`   ⚠️ Agent ${agent.id} failed round ${round}: ${err.message.slice(0, 60)}`);
      }
    }

    timeline.push({ round, events: roundEvents });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   Round ${round}/${rounds} complete (${roundEvents.length} actions, ${elapsed}s elapsed)`);
  }

  console.log(`   ✅ Simulation complete: ${timeline.reduce((s, r) => s + r.events.length, 0)} total events`);
  return { timeline, agents, worldId: castResult.worldId, _startTime: startTime };
}


// ═══════════════════════════════════════════════════════════════════════
// STAGE 4: ASSAY — Generate prediction report
// ═══════════════════════════════════════════════════════════════════════

async function assay(forgeResult, question) {
  console.log('📊 ASSAY — Generating prediction report...');

  // Compress timeline for context window
  const compressed = forgeResult.timeline.map(r => ({
    round: r.round,
    actions: r.events.slice(0, 8).map(e => `[${e.archetype}] ${e.agentName}: ${e.action}`)
  }));

  // Count opinion shifts
  const shifts = { positive: 0, negative: 0, unchanged: 0 };
  forgeResult.timeline.forEach(r => r.events.forEach(e => {
    if (e.opinion_shift?.includes('positive')) shifts.positive++;
    else if (e.opinion_shift?.includes('negative')) shifts.negative++;
    else shifts.unchanged++;
  }));

  const report = await callLLM(
    `You are a senior analyst writing a prediction report based on a multi-agent simulation.
     
     Question: "${question}"
     
     Simulation summary (${forgeResult.timeline.length} rounds, ${forgeResult.agents.length} agents):
     ${JSON.stringify(compressed.slice(-10))}
     
     Opinion trend: ${shifts.positive} shifted positive, ${shifts.negative} shifted negative, ${shifts.unchanged} unchanged
     
     Agent final positions:
     ${forgeResult.agents.map(a => `- ${a.name} (${a.archetype}): last said "${a.memory.slice(-1)[0]?.action || 'nothing'}"`).join('\n')}
     
     Write a professional prediction report with these EXACT sections:
     
     ## Executive Summary
     (2-3 sentences answering the question)
     
     ## Key Predictions
     (3-5 bullet points with confidence percentages)
     
     ## Risk Factors
     (2-4 risks identified by the simulation)
     
     ## Agent Consensus vs. Minority Opinions
     (What did most agents agree on? Who dissented and why?)
     
     ## Recommended Actions
     (3-5 actionable recommendations)
     
     ## Simulation Metadata
     - Agents: ${forgeResult.agents.length}
     - Rounds: ${forgeResult.timeline.length}
     - Confidence: [0-100 based on agent consensus]`,
    { provider: 'gemini' }
  );

  // Try to record in skill memory
  try {
    const skillMemoryPath = path.join(process.cwd(), 'scripts', 'skill-memory.mjs');
    if (fs.existsSync(skillMemoryPath)) {
      const { recordResult } = await import(skillMemoryPath);
      recordResult('forge-simulator', `sim_${Date.now()}`, true, {
        durationMs: Date.now() - forgeResult._startTime,
        context: { question, agentCount: forgeResult.agents.length, rounds: forgeResult.timeline.length }
      });
    }
  } catch {}

  console.log('   ✅ Report generated');
  return { report, question, worldId: forgeResult.worldId, shifts };
}


// ═══════════════════════════════════════════════════════════════════════
// SAVE + LOAD (Local JSON — zero cost)
// ═══════════════════════════════════════════════════════════════════════

async function saveWorld(forgeResult, assayResult) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const worldFile = path.join(DATA_DIR, `${forgeResult.worldId}.json`);
  
  const world = {
    worldId: forgeResult.worldId,
    domain: forgeResult.domain,
    question: assayResult.question,
    createdAt: new Date().toISOString(),
    agents: forgeResult.agents.map(a => ({
      id: a.id, name: a.name, archetype: a.archetype,
      personality: a.personality, goals: a.goals,
      memory: a.memory
    })),
    timeline: forgeResult.timeline,
    report: assayResult.report,
    shifts: assayResult.shifts
  };

  fs.writeFileSync(worldFile, JSON.stringify(world, null, 2));
  console.log(`💾 World saved locally: ${worldFile}`);
  
  // Cloud sync — zero cost (Supabase free tier)
  if (isCloudEnabled()) {
    console.log('☁️  Syncing world to cloud (Supabase)...');
    const cloudSaved = await saveWorldToCloud(world);
    if (cloudSaved) console.log('   ✅ Cloud sync complete');
  } else {
    console.log('   ℹ️ Cloud sync skipped (No Supabase keys)');
  }
  
  return worldFile;
}

function listWorlds() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const w = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
        return { file: f, worldId: w.worldId, question: w.question, createdAt: w.createdAt, agents: w.agents?.length };
      } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}


// ═══════════════════════════════════════════════════════════════════════
// FULL PIPELINE
// ═══════════════════════════════════════════════════════════════════════

export async function runForge({ domain, ore, question, rounds = 20, agentCounts = {} }) {
  console.log(`\n🔥 ══════════════════════════════════════════════════`);
  console.log(`   FORGE SIMULATOR — ${domain || 'generic'} domain`);
  console.log(`   Question: "${question}"`);
  console.log(`   Rounds: ${rounds}`);
  console.log(`══════════════════════════════════════════════════════\n`);

  const smeltResult = await smelt(ore);
  const castResult = await cast(smeltResult, { domain, agentCounts });
  const forgeResult = await forge(castResult, { question, rounds });
  const assayResult = await assay(forgeResult, question);
  
  const worldFile = await saveWorld(forgeResult, assayResult);

  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`   ✅ SIMULATION COMPLETE`);
  console.log(`   World: ${forgeResult.worldId}`);
  console.log(`   Saved: ${worldFile}`);
  console.log(`══════════════════════════════════════════════════════\n`);
  console.log(assayResult.report);

  return {
    worldId: forgeResult.worldId,
    report: assayResult.report,
    agents: forgeResult.agents,
    timeline: forgeResult.timeline,
    worldFile,
    confidence: extractConfidence(assayResult.report)
  };
}

function extractConfidence(report) {
  const match = report.match(/[Cc]onfidence[:\s]*(\d+)/);
  return match ? parseInt(match[1]) : null;
}


// ═══════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
  console.log(`
🔥 Forge Simulator — Multi-Agent Prediction Engine

Usage:
  node run-simulation.mjs --domain <domain> --ore <data> --question <question> [--rounds <n>]
  node run-simulation.mjs --history
  node run-simulation.mjs --inspect <worldId> <agentId> <message>

Domains: generic, market, social-media, engineering, crisis, financial, gaming

Examples:
  node run-simulation.mjs \\
    --domain market \\
    --ore "Our competitor just launched a free tier targeting our customers" \\
    --question "How does this affect our paid conversion rate?" \\
    --rounds 15

  node run-simulation.mjs \\
    --domain social-media \\
    --ore data/youtube-empire/niche-analytics.json \\
    --question "Which content style drives most engagement?" \\

  node run-simulation.mjs --history
  `);
  process.exit(0);
}

if (args.includes('--history')) {
  const worlds = listWorlds();
  if (worlds.length === 0) {
    console.log('No forge worlds found. Run a simulation first!');
  } else {
    console.log(`\n📜 Forge World History (${worlds.length} simulations):\n`);
    worlds.forEach((w, i) => {
      console.log(`  ${i + 1}. ${w.worldId}`);
      console.log(`     Question: ${w.question}`);
      console.log(`     Agents: ${w.agents} | Created: ${w.createdAt}`);
      console.log();
    });
  }
  process.exit(0);
}

// Parse CLI args
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const domain = getArg('domain') || 'generic';
const ore = getArg('ore') || '';
const question = getArg('question') || '';
const rounds = parseInt(getArg('rounds') || '20');

if (!question) {
  console.error('❌ --question is required');
  process.exit(1);
}
if (!ore) {
  console.error('❌ --ore is required (text or file path)');
  process.exit(1);
}

runForge({ domain, ore, question, rounds }).catch(err => {
  console.error('❌ Simulation failed:', err.message);
  process.exit(1);
});
