import { supabase } from '../lib/supabase.js';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import { generateWithYield } from './ai-router.js';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Telemetry Logger Function
async function logTelemetry(eventType: string, message: string) {
  console.log(`\x1b[36m[${eventType}]\x1b[0m ${message}`);
  try {
    await supabase.from('forge_events').insert({
      event_type: eventType,
      message,
      agent_id: 'autonomous_worker'
    });
  } catch (err) {
    console.error('Failed to stream telemetry to UI.', err);
  }
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
    
    // Choose a random High-Signal target to scrape for live intelligence
    const targetUrl = TARGET_MARKETS[Math.floor(Math.random() * TARGET_MARKETS.length)];
    
    // Attempt live scraping
    try {
      logTelemetry('GATHER', `Spun up Market Analyzer agent pointing at ${targetUrl}...`);
      scrapedData = await scrapeMarketData(targetUrl);
      logTelemetry('ANALYZE', `Extracted ${scrapedData.length} bytes of raw competitive intelligence.`);
    } catch (e) {
      logTelemetry('WARN', `Live scraping failed. Yielding to internal vector hallucination.`);
    }

    const systemPrompt = `You are the Crucible Core Autonomous Engineer.
You have been given a scraping analysis payload of a high tier agent framework:

--- RAW MARKET DATA (${targetUrl}) ---
${scrapedData}
--- END RAW MARKET DATA ---

Your task is to analyze this logic, then invent a brand new, extremely advanced addition to the Crucible platform.
You must output a raw, parseable JSON object representing a file that the system will physically write to the repository.

Valid file types and paths:
1. skills/forged/[skill-name].md - Markdown defining an overarching architecture or system prompt protocol.
2. scripts/forged/[script-name].ts - A typescript script file offering some tool logic.
3. src/mcp/forged/[mcp-name].ts - A Model Context Protocol server connector.
4. plugins/forged/[plugin-name].ts - A pluggable code modification extension.
5. docs/forged/[doc-name].md - High level conceptual documentation of the platform capabilities.

You must only output the pure JSON object (no markdown quotes, no explanations).
Format:
{
  "filepath": "skills/forged/your-new-skill.md",
  "content": "The actual file content goes here..."
}
`;
    
    // Let the multi-AI router decide which free tier model handles this request
    logTelemetry('FORGE', `Prompting Multi-AI Router for recursive code synthesis...`);
    let text = await generateWithYield(systemPrompt);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
       console.error("Failed to parse AI output as JSON. Raw text was:\n", text);
       throw parseError;
    }
    
    if (parsed.filepath && parsed.content) {
       return parsed;
    } else {
       throw new Error("Invalid format from LLM");
    }
  } catch (e: any) {
    logTelemetry('ERROR', `AI Generation failed across all routers: ${e.message}`);
    // Fallback Mock
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const name = `${adj} ${noun}`;
    
    return {
      filepath: `skills/forged/${name.toLowerCase().replace(' ', '-')}.md`,
      content: `# ${name}\n\nAutonomously forged skill designed to optimize specific operations at scale.`
    };
  }
}

async function forgeTick() {
  logTelemetry('FORGE_CYCLE', `Initiated forge cycle at ${new Date().toISOString()}`);
  
  // 1. GATHER (Select Target URL) - Now handled within generateMarketConcept
  // 2. ANALYZE (Live Web Scrape) - Now handled within generateMarketConcept

  await sleep(1000);

  // Generate mock vector data (We keep this mock until we integrate a real embedding model)
  const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  const normalized = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
  const finalEmbedding = mockEmbedding.map(val => val / normalized);

  const insightContent = `Autonomous Forge Insight: AI generated new platform feature.`;

  // 3. STORE (Database + Disk)
  logTelemetry('STORE', `Smelting data into vectorized memory and generating local code asset...`);
  
  try {
    const generatedCode = await generateMarketConcept('skill', {}); // Pass empty object as existingItems is not used directly now
    
    const { error } = await supabase.from('market_research').insert({
      content: insightContent,
      source_url: generatedCode.filepath, // Using filepath as a proxy for source_url for now
      component_type: 'platform_architecture',
      aesthetic_tags: ['autonomous', 'agentic', 'industrial'],
      embedding: finalEmbedding,
    });

    if (error) {
      logTelemetry('ERROR', `Failed to store market vector: ${error.message}`);
    } else {
      logTelemetry('SUCCESS', `Database memory updated successfully.`);
      
      // Physically expand the product by writing the code File
      if (generatedCode?.filepath && generatedCode?.content) {
         // Resolve path relative to workspace root (two dirs up from crucible-web)
         const absolutePath = path.resolve(process.cwd(), '../../', generatedCode.filepath);
         
         // Ensure directory exists
         const dir = path.dirname(absolutePath);
         if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
         }
         
         fs.writeFileSync(absolutePath, generatedCode.content);
         logTelemetry('DEPLOY', `New recursive AI code asset deployed to: ${generatedCode.filepath}`);
      } else {
         logTelemetry('WARN', `Generator failed to return a valid filepath and content.`);
      }
    }
  } catch (err: any) {
    logTelemetry('ERROR', `File System write failed: ${err.message}`);
  }

  // 4. SLEEP (Regulate CPU - drastically sped up for demo loops)
  const delaySeconds = Math.floor(Math.random() * 5) + 5; // 5-10 seconds
  logTelemetry('STANDBY', `Reactor cooling for ${delaySeconds} seconds...`);
  
  await sleep(delaySeconds * 1000);
}

async function bootSequence() {
  console.log(`\x1b[38;2;255;140;0m`);
  console.log(`  ██████╗ ██████╗ ██╗   ██╗ ██████╗██╗██████╗ ██╗     ███████╗`);
  console.log(` ██╔════╝ ██╔══██╗██║   ██║██╔════╝██║██╔══██╗██║     ██╔════╝`);
  console.log(` ██║  ███╗██████╔╝██║   ██║██║     ██║██████╔╝██║     █████╗  `);
  console.log(` ██║   ██║██╔══██╗██║   ██║██║     ██║██╔══██╗██║     ██╔══╝  `);
  console.log(` ╚██████╔╝██║  ██║╚██████╔╝╚██████╗██║██████╔╝███████╗███████╗`);
  console.log(`  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝╚═════╝ ╚══════╝╚══════╝`);
  console.log(`\x1b[0m`);
  console.log(`\x1b[1m\x1b[38;2;0;255;136m[SYSTEM ONLINE]\x1b[0m Autonomous Engine v1.0 connected to Supabase.`);
  console.log(`\x1b[90mExecuting SINGLE DRY-RUN for Vercel deployment test...\x1b[0m\n`);

  await forgeTick();
  
  console.log(`\x1b[38;2;0;255;136m[DRY-RUN COMPLETE]\x1b[0m Autonomous feature generated. Ready for Vercel deployment.`);
  process.exit(0);
}

// Start immediately
bootSequence().catch(console.error);
