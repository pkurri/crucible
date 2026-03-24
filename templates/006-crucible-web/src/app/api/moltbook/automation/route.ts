import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateText } from '@/lib/ai-router';

/**
 * PRO SPEED: 10s Vercel Limit Optimization
 * RULEBOOK: Skill.md Priorities + "Always Post" Strategy for 24h+ Accounts
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';
const SYSTEM_PROMPT = `You are a professional industrial AI (analytical tone). NO CRYPTO. 1-2 sentences.`;

const BRAND_MAP: Record<string, string> = {
  CrucibleForge: 'forge-hq', DebtRadar: 'forge-burnrate', CVEWatcher: 'forge-sec',
  ArXivPulse: 'forge-research', DriftDetector: 'forge-drift', VCSignal: 'forge-vc',
  LegislAI: 'forge-policy', MicroSaaSRadar: 'forge-saas', EthicsBoard: 'forge-ethics',
  DevTrendMap: 'forge-trends', RevenueOptimizer: 'forge-revenue', GrowthMarketeer: 'forge-growth',
  UA_PRO: 'forge-growth-engine', ORACLE: 'forge-gaming-trends'
};

/**
 * Autonomous Moltbook API client with verification solving.
 */
async function moltbookApi(path: string, method: string, body: any, apiKey: string): Promise<any> {
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const req = async (p: string, m: string, b: any) => {
    const res = await fetch(`${MOLTBOOK_API}${p}`, { method: m, headers, cache: 'no-store', body: b ? JSON.stringify(b) : undefined });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error(`Non-JSON HTTP ${res.status}`); }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    return data;
  };
  const data = await req(path, method, body);
  // Solve verification math challenges (Lobster Protocol)
  if (data.verification_required && data.verification) {
    const { verification_code, challenge_text } = data.verification;
    const answer = await generateText(`Solve math result only: "${challenge_text}"`);
    const cleanNum = answer?.match(/[-+]?[0-9]*\.?[0-9]+/)?.[0] || "0.00";
    return await req('/verify', 'POST', { verification_code, answer: cleanNum });
  }
  return data;
}

export async function GET(request: Request) {
  const start = Date.now();
  const results: any[] = [];
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const apiKey = process.env.MOLTBOOK_API_KEY;
    if (!apiKey) throw new Error('API Key Missing');

    // 1. Initial State Check (🔴 Skill.md First Step)
    const home = await moltbookApi('/home', 'GET', null, apiKey);
    const me = home.your_account;
    const unreadCount = me.unread_notification_count || 0;
    const isEstablished = (Date.now() - new Date(me.created_at || Date.now()).getTime()) > 86400000;
    results.push({ step: 'init', name: me.name, karma: me.karma, unread: unreadCount, isEstablished });

    // 2. PRIMARY ACTION: REPLIES (🔴 Highest Priority)
    if (unreadCount > 0) {
      const active = (home.activity_on_your_posts || []).find((p: any) => p.new_notification_count > 0);
      if (active) {
        const comments = await moltbookApi(`/posts/${active.post_id}/comments?sort=new`, 'GET', null, apiKey);
        const target = (comments.comments || [])[0];
        if (target) {
          const reply = await generateText(`${SYSTEM_PROMPT}\nAnalytical reply to: "${target.content}". Short.`);
          if (reply) {
            await moltbookApi(`/posts/${active.post_id}/comments`, 'POST', { content: reply, parent_id: target.id }, apiKey);
            results.push({ step: 'reply_to_mention', pid: active.post_id });
          }
        }
        await moltbookApi(`/notifications/read-by-post/${active.post_id}`, 'POST', {}, apiKey);
      }
    }

    // 3. SECONDARY ACTION: BROADCAST (🔵 Post on EVERY cycle for established accounts)
    // For established bots, we post every 30m. For new ones, we rotatingly skip to avoid rate limits.
    const now = new Date();
    const shouldPost = isEstablished || (now.getHours() % 2 === 0 && now.getMinutes() >= 30);
    
    if (shouldPost) {
      const brands = Object.entries(BRAND_MAP);
      const [brand, niche] = brands[Math.floor(Math.random() * brands.length)];
      const text = await generateText(`${SYSTEM_PROMPT}\nExpert pulse for m/${niche} as ${brand}. 200 chars max.`);
      const postRes = await moltbookApi('/posts', 'POST', { submolt_name: niche, title: `${brand} Intelligence`, content: text }, apiKey);
      const pid = postRes.content_id || postRes.post?.id || postRes.id;
      if (pid) {
        try { await moltbookApi(`/posts/${pid}/pin`, 'POST', null, apiKey); } catch(e) {}
        results.push({ step: 'broadcast', brand, pid });
      }
    } else {
      // For new accounts, do a secondary ENGAGE task instead of posting every time
      results.push({ step: 'growth_throttle_active', reason: 'account_under_24h' });
    }

    return NextResponse.json({ success: true, results, durationMs: Date.now() - start });
  } catch (error: any) {
    console.error('[Moltbook Cron Error]', error);
    return NextResponse.json({ success: false, error: error.message, results, durationMs: Date.now() - start }, { status: 500 });
  }
}
