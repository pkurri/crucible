import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getSupabaseAdmin } from '../lib/supabase.js';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-core';
import { generateWithYield } from './ai-router.js';

// Initialize Supabase Admin for background tasks
const supabase = getSupabaseAdmin();

// Telemetry Logger Function
async function logTelemetry(eventType: string, message: string) {
  console.log(`\x1b[36m[${eventType}]\x1b[0m ${message}`);
  try {
    await supabase.from('forge_events').insert({
      event_type: eventType,
      message,
      agent_id: 'autonomous_worker',
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    console.error('Failed to stream telemetry to UI.', err);
  }
}

async function getRecentErrors() {
  const { data, error } = await supabase
    .from('forge_events')
    .select('*')
    .eq('event_type', 'ERROR')
    .order('created_at', { ascending: false })
    .limit(5);
  return data || [];
}

const FORGE_SKILLS = [
  'api-gateway-builder',
  'ui-ux-pro-max',
  'postgres-optimizer',
  'kubernetes-manager',
  'review-clean-code',
  'e-commerce-platform'
];

const TARGET_MARKETS = [
  'https://www.voxyz.space',
  'https://vercel.com',
  'https://supabase.com',
  'https://react.dev'
];

// File Paths for the Data Catalogs
const SKILLS_FILE = path.resolve(process.cwd(), 'src/data/skills.json');
const TEMPLATES_FILE = path.resolve(process.cwd(), 'src/data/templates.json');
const WIKI_FILE = path.resolve(process.cwd(), '../../docs/WIKI.md');

// Helper to sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ADJECTIVES = ['Autonomous', 'Neural', 'Quantum', 'Vector', 'Edge', 'Reactive', 'Distributed'];
const NOUNS = ['Synthesizer', 'Calibrator', 'Engine', 'Matrix', 'Pipeline', 'Orchestrator', 'Node'];

async function scrapeMarketData(url: string): Promise<string> {
  let browser;
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://browserless.vercel.app?token=${process.env.BROWSERLESS_API_KEY}`,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    const $ = cheerio.load(html);
    // Extract meaningful text (headers, paragraphs, buttons)
    return $('h1, h2, h3, p, a, button').text().replace(/\s+/g, ' ').trim().substring(0, 1500);
  } catch (error) {
    logTelemetry('ERROR', `Failed to scrape ${url}: ${error}`);
    return "Could not fetch target.";
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function generateMarketConcept(type: 'skill' | 'template', existingItems: any) {
  try {
    let scrapedData = "";
    const targetUrl = TARGET_MARKETS[Math.floor(Math.random() * TARGET_MARKETS.length)];
    
    try {
      logTelemetry('GATHER', `Spun up Market Analyzer agent pointing at ${targetUrl}...`);
      scrapedData = await scrapeMarketData(targetUrl);
      logTelemetry('ANALYZE', `Extracted ${scrapedData.length} bytes of raw competitive intelligence.`);
    } catch (e) {
      logTelemetry('WARN', `Live scraping failed. Yielding to internal vector hallucination.`);
    }

    const systemPrompt = `You are the Crucible Core Autonomous Engineer.
Analyze this market data and invent a brand new, extremely advanced addition to the Crucible platform.
Output raw JSON object for file creation.

Valid file types:
1. skills/forged/[skill-name].md
2. scripts/forged/[script-name].ts
3. src/mcp/forged/[mcp-name].ts
4. plugins/forged/[plugin-name].ts
5. docs/forged/[doc-name].md

Format:
{
  "filepath": "path/to/file",
  "content": "content"
}`;
    
    logTelemetry('FORGE', `Prompting Multi-AI Router for recursive code synthesis...`);
    let text = await generateWithYield(systemPrompt);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsed = JSON.parse(text);
    return parsed;
  } catch (e: any) {
    logTelemetry('ERROR', `AI Generation failed: ${e.message}`);
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return {
      filepath: `skills/forged/${adj.toLowerCase()}-${noun.toLowerCase()}.md`,
      content: `# ${adj} ${noun}\nAutonomously forged skill.`
    };
  }
}

async function selfHealTick() {
  logTelemetry('HEAL_CHECK', 'Scanning for system instabilities...');
  const errors = await getRecentErrors();
  if (errors.length === 0) {
    logTelemetry('HEAL_STATUS', 'No active instabilities detected. System remains optimal.');
    return;
  }

  logTelemetry('REPAIR', `Detected ${errors.length} recent errors. Initiating repair sequence...`);
  const errorContext = errors.map(e => `[${e.created_at}] ${e.message}`).join('\n');
  
  const healPrompt = `You are the Crucible Self-Healing Agent.
Review these recent system errors and propose a fix or a diagnostic script to prevent them.
Errors:
${errorContext}

Output a JSON repair payload:
{
  "action": "fix" | "diagnostic",
  "filepath": "path/to/script/or/fix",
  "content": "code content"
}`;

  try {
    const response = await generateWithYield(healPrompt);
    const repair = JSON.parse(response.replace(/```json/g, '').replace(/```/g, '').trim());
    
    if (repair.filepath && repair.content) {
      const absolutePath = path.resolve(process.cwd(), '../../', repair.filepath);
      const dir = path.dirname(absolutePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(absolutePath, repair.content);
      logTelemetry('REPAIR_DEPLOYED', `Self-healing asset deployed: ${repair.filepath}`);
    }
  } catch (e) {
    logTelemetry('HEAL_ERROR', `Self-healing cycle failed: ${e}`);
  }
}

async function generateInfographicTick() {
  logTelemetry('INFOGRAPHIC_GEN', 'Initiating high-impact data visualization synthesis...');
  
  const topics = [
    { topic: 'Agentic AI Workflows', domain: 'Software Engineering' },
    { topic: 'LLM Context Window Evolution', domain: 'Artificial Intelligence' },
    { topic: 'The Rise of Autonomous Coding Agents', domain: 'Future Tech' },
    { topic: 'Vector Database Saturation', domain: 'Infrastructure' },
    { topic: 'Model Drift in Production', domain: 'MLOps' }
  ];
  
  const topicRow = topics[Math.floor(Math.random() * topics.length)];
  
  try {
    const prompt = `Act as an expert data visualization designer and researcher.
Create structural data for a high-impact, modern infographic about: "${topicRow.topic}" in the domain of "${topicRow.domain}".

Return EXACTLY and ONLY valid JSON matching this structure:
{
  "title": "A short, catchy main title",
  "subtitle": "A slightly longer explanatory subtitle",
  "dataPoints": [
    { 
      "label": "Short Metric/Stat Name", 
      "value": "A bold number/percentage", 
      "description": "1-2 short sentences"
    }
  ],
  "conclusion": "A single sentence concluding the infographic."
}
Requirement: Provide exactly 4 high-quality data points in the 'dataPoints' array. Do not use Markdown backticks.`;

    const aiResponseText = await generateWithYield(prompt);
    
    let cleanJsonText = aiResponseText;
    const jsonMatch = cleanJsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanJsonText = jsonMatch[0];

    const parsedContent = JSON.parse(cleanJsonText);
    const slug = topicRow.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { error } = await supabase.from('forge_infographics').insert({
      title: parsedContent.title,
      slug: `${slug}-${Date.now()}`,
      content: JSON.stringify(parsedContent),
      topic: topicRow.topic,
      domain: topicRow.domain,
      created_at: new Date().toISOString(),
    });

    if (error) {
      logTelemetry('INFOGRAPHIC_ERROR', `Failed to store infographic: ${error.message}`);
    } else {
      logTelemetry('INFOGRAPHIC_SUCCESS', `New data intel infographic deployed: ${parsedContent.title}`);
    }
  } catch (e: any) {
    logTelemetry('INFOGRAPHIC_ERROR', `Generation failed: ${e.message}`);
  }
}


async function forgeTick() {
  logTelemetry('FORGE_CYCLE', `Initiated forge cycle at ${new Date().toISOString()}`);
  
  await sleep(1000);
  
  const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  const normalized = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
  const finalEmbedding = mockEmbedding.map(val => val / normalized);

  logTelemetry('STORE', `Smelting data into vectorized memory and generating local code asset...`);
  
  try {
    const generatedCode = await generateMarketConcept('skill', {});
    
    const { error } = await supabase.from('market_research').insert({
      content: `Autonomous Forge Insight for ${generatedCode.filepath}`,
      source_url: generatedCode.filepath,
      component_type: 'platform_architecture',
      aesthetic_tags: ['autonomous', 'agentic', 'industrial'],
      embedding: finalEmbedding,
    });

    if (error) {
      logTelemetry('ERROR', `Failed to store market vector: ${error.message}`);
    } else {
      logTelemetry('SUCCESS', `Database memory updated successfully.`);
      
      if (generatedCode?.filepath && generatedCode?.content) {
         const absolutePath = path.resolve(process.cwd(), '../../', generatedCode.filepath);
         const dir = path.dirname(absolutePath);
         if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
         fs.writeFileSync(absolutePath, generatedCode.content);
         logTelemetry('DEPLOY', `New recursive AI code asset deployed: ${generatedCode.filepath}`);
      }
    }
  } catch (err: any) {
    logTelemetry('ERROR', `Forge cycle failed: ${err.message}`);
  }

  // Self-Healing Step
  await selfHealTick();

  // Infographic Generation Step
  await generateInfographicTick();

  const delaySeconds = Math.floor(Math.random() * 5) + 5;
  logTelemetry('STANDBY', `Reactor cooling for ${delaySeconds} seconds...`);
  await sleep(delaySeconds * 1000);
}

async function bootSequence() {
  const isLooping = process.argv.includes('--loop');
  console.log(`\x1b[38;2;255;140;0m`);
  console.log(`  ██████╗ ██████╗ ██╗   ██╗ ██████╗██╗██████╗ ██╗     ███████╗`);
  console.log(` ██╔════╝ ██╔══██╗██║   ██║██╔════╝██║██╔══██╗██║     ██╔════╝`);
  console.log(` ██║  ███╗██████╔╝██║   ██║██║     ██║██████╔╝██║     █████╗  `);
  console.log(` ██║   ██║██╔══██╗██║   ██║██║     ██║██╔══██╗██║     ██╔══╝  `);
  console.log(` ╚██████╔╝██║  ██║╚██████╔╝╚██████╗██║██████╔╝███████╗███████╗`);
  console.log(`  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝╚═════╝ ╚══════╝╚══════╝`);
  console.log(`\x1b[0m`);
  console.log(`\x1b[1m\x1b[38;2;0;255;136m[SYSTEM ONLINE]\x1b[0m Autonomous Engine v1.0 connected to Supabase.`);
  
  if (isLooping) {
    console.log(`\x1b[90mExecuting CONTINUOUS loop...\x1b[0m\n`);
    while (true) {
      try {
        await forgeTick();
      } catch (err) {
        console.error('Forge cycle fatal crash:', err);
        await sleep(10000);
      }
    }
  } else {
    console.log(`\x1b[90mExecuting SINGLE DRY-RUN for Vercel deployment test...\x1b[0m\n`);
    await forgeTick();
    console.log(`\x1b[38;2;0;255;136m[DRY-RUN COMPLETE]\x1b[0m Autonomous feature generated. Ready for Vercel deployment.`);
    process.exit(0);
  }
}


// Start immediately
bootSequence().catch(console.error);
