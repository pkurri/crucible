import fs from 'fs';
import path from 'path';
import { generateWithYield } from './ai-router';
import { getCompetitorContext } from './market-researcher';

const DATA_DIR = path.join(process.cwd(), 'data');

async function main() {
  console.log('🤖 Starting Revenue / Monetization Agent...');
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const siteContext = `
    Product: Crucible
    Type: AI Agent Orchestration, Next.js Templates, Autonomous Workers, Genkit pipelines.
    Target Audience: Developers, startups, small agencies wanting to build agentic workflows fast.
    Current features: 
    - Automated infographic generation Pipeline
    - Autonomous web scraping and reasoning agents
    - Multi-LLM AI Router (Gemini, Cerebras, Groq, etc.)
    - Secure Database (Supabase / Drizzle)
  `;

  // 1. Generate Pricing
  console.log('💰 Revenue Agent: Computing optimal pricing tiers...');
  
  // 0. Market Research
  const competitors = await getCompetitorContext();
  const competitorInfo = JSON.stringify(competitors, null, 2);

  const pricingPrompt = `
    You are the Chief Revenue Officer for an AI startup offering the following product:
    ${siteContext}
    
    Current Market Landscape (Competitors):
    ${competitorInfo}
    
    Based on the product and the current market:
    Come up with a 3-tier pricing model (Free, Pro, Enterprise/Cloud) that is competitive and optimized for conversion.
    Return ONLY a valid, raw JSON array of objects representing the tiers, no markdown formatting (no \`\`\`json).
    Each object must have:
    - name (string: tier name)
    - price (string: e.g. "$0/mo", "$49/mo", "Custom")
    - description (string: 1 sentence summary)
    - features (array of strings: 4-5 bullet points)
    - targeted_at (string: e.g. "Hobbyists", "Teams")
  `;

  let pricingStrategyRaw = await generateWithYield(pricingPrompt, 'reasoning');
  // cleanup just in case it added markdown
  pricingStrategyRaw = pricingStrategyRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  try {
    const parsedPricing = JSON.parse(pricingStrategyRaw);
    fs.writeFileSync(path.join(DATA_DIR, 'pricing.json'), JSON.stringify(parsedPricing, null, 2));
    console.log('✅ Generated optimal pricing strategy -> data/pricing.json');
  } catch (err) {
    console.error('❌ Failed to parse JSON from AI:', pricingStrategyRaw);
  }

  // 2. Generate Sales Copy
  console.log('✍️ Revenue Agent: Crafting conversion-optimized sales copy...');
  
  const salesPrompt = `
    You are an expert copywriter. The client is selling this product:
    ${siteContext}
    
    Based on this, write high-converting landing page sales copy. Include:
    1. A punchy H1 headline that addresses the pain point (wasting time building agents).
    2. A supportive Subheadline.
    3. Three main benefits (not just features, but *benefits* like "Launch Agents 10x Faster").
    4. A call to action (CTA).
    
    Return the copy in Markdown format.
  `;

  const salesCopy = await generateWithYield(salesPrompt, 'fast');
  fs.writeFileSync(path.join(DATA_DIR, 'sales-copy.md'), salesCopy);
  console.log('✅ Generated sales copy -> data/sales-copy.md');
  
  console.log('🎉 Revenue Agent run complete! The storefront is now updated.');
}

main().catch((err) => {
  console.error('Fatal error in Revenue Agent:', err);
});
