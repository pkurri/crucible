import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateText } from '@/lib/ai-router';

export const maxDuration = 60; // 60s max for Vercel Free, 300s for Pro

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

const BRAND_MAP: Record<string, string> = {
  CrucibleForge: 'forge-hq',
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

async function moltbookApi(path: string, method: string, body: any, apiKey: string) {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  const res = await fetch(`${MOLTBOOK_API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.substring(0, 100)}`);
  }
  
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

export async function GET(request: Request) {
  // Cron Secret Validation
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const apiKey = process.env.MOLTBOOK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'MOLTBOOK_API_KEY missing' }, { status: 500 });
  }

  try {
    // 1. Pick a random brand to post as CrucibleForge (Unified Strategy)
    const brands = Object.entries(BRAND_MAP);
    const [brandName, submolt] = brands[Math.floor(Math.random() * brands.length)];
    
    console.log(`[Moltbook Cron] Activating ${brandName} protocol...`);

    // 2. Trigger Logic: Check if we can post (Optional: Use Supabase for persistence)
    // For now, we'll try to post. If Moltbook rate limits us, it will throw.

    // 2. Setup Guardrails & Submolt Context
    const communityRules = `
Moltbook Community Guardrails:
- Be Genuine: Share real industrial insights or market signals. No filler content.
- Quality Over Quantity: Ensure the post is thoughtful and valuable.
- Respect the Commons: Stay strictly on-topic for the specific niche submolt.
- No Low-Effort: Avoid one-word, emoji-only, or repetitive content.
- No Excessive Self-Promotion: Focus on intelligence, not selling.
- NO CRYPTO: Do not mention cryptocurrency or blockchain unless specifically relevant to the industrial niche.
`;

    // 4. Post to Moltbook (with Retry for missing submolts)
    let postRes;
    const availableBrands = Object.entries(BRAND_MAP);
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const [brandName, submolt] = availableBrands[Math.floor(Math.random() * availableBrands.length)];
      console.log(`[Moltbook] Posting attempt ${attempts + 1} as ${brandName} to m/${submolt}...`);
      
      try {
        const prompt = `You are ${brandName}, part of the Crucible industrial AI fleet. 
Your niche is: ${submolt}.

${communityRules}

Task: Write an original, professional, and slightly provocative Moltbook post about a recent "market signal" or "threat" in your niche.

Requirements:
- Professional, analytical tone aligned with the ${brandName} persona.
- Length: Concise (ideally under 280 characters, max 500).
- Highlight a specific industrial insight or discovery.
- End with an engaging question for the community.
- Strict adherence to the Moltbook Community Guardrails above.

Output ONLY the post body text.`;

        const content = await generateText(prompt);
        if (!content) throw new Error('Failed to generate content');

        postRes = await moltbookApi('/posts', 'POST', {
          submolt_name: submolt,
          title: `${brandName} Intelligence Brief`,
          content: content,
          type: 'text'
        }, apiKey);
        
        // Success!
        console.log(`[Moltbook] Success: Posted as ${brandName} to m/${submolt}`);
        
        // Log successful brand in response or event
        await supabase.from('forge_events').insert({
          event_type: 'MOLTBOOK_POST',
          message: `Posted ${brandName} intelligence to m/${submolt}`,
          agent_id: 'moltbook-cron',
          metadata: { post_id: postRes.post?.id || postRes.id, brand: brandName }
        });

        return NextResponse.json({
          success: true,
          brand: brandName,
          submolt,
          post_id: postRes.post?.id || postRes.id
        });

      } catch (err: any) {
        if (err.message.includes('404') && attempts < maxAttempts - 1) {
          console.warn(`[Moltbook] m/${submolt} not found. Retrying with different brand...`);
          attempts++;
          continue;
        }
        throw err;
      }
    }

  } catch (error: any) {
    console.error('[Moltbook Cron] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
