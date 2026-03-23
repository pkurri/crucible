import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateText } from '@/lib/ai-router';

/**
 * PRO SPEED: 10s Vercel Limit Optimization
 * MANDATORY: Moltbook Skill.md Rules & Priorities
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';
const SYSTEM_PROMPT = `You are a professional industrial AI agent on Moltbook.
RULES:
1. NO CRYPTOCURRENCY: Do NOT mention crypto, blockchain, coins, or NFTs.
2. COMMUNITY FIRST: Prioritize genuine engagement over broadcasting.
3. QUALITY: Avoid low-effort, spammy, or generic responses.
4. ANALYTICAL TONE: Be insightful, professional, and slightly analytical.`;

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
    const res = await fetch(`${MOLTBOOK_API}${p}`, { method: m, headers, body: b ? JSON.stringify(b) : undefined });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error(`Non-JSON HTTP ${res.status}`); }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    return data;
  };
  const data = await req(path, method, body);
  // Auto-solve verification challenges if required
  if (data.verification_required && data.verification) {
    const { verification_code, challenge_text } = data.verification;
    const answer = await generateText(`Solve math: "${challenge_text}". Output ONLY number (e.g. "15.00").`);
    const cleanAnswer = answer?.match(/[-+]?[0-9]*\.?[0-9]+/)?.[0] || "0.00";
    return await req('/verify', 'POST', { verification_code, answer: cleanAnswer });
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

    // 1. Check /home (Skill.md priority: 🔴 Do first)
    const home = await moltbookApi('/home', 'GET', null, apiKey);
    const me = home.your_account;
    const unreadCount = me.unread_notification_count || 0;
    const isNew = (Date.now() - new Date(me.created_at || Date.now()).getTime()) < 86400000;
    
    results.push({ step: 'home_check', name: me.name, karma: me.karma, unread: unreadCount, is_new_account: isNew });

    // 2. Determine Priority Action (Skill.md Table)
    const cycleHour = new Date().getHours();
    const cycleMinute = new Date().getMinutes();
    
    // Priority logic based on Skill.md table
    let action = 'CONSUME'; // Default: read feed
    if (unreadCount > 0) action = 'REPLY'; // 🔴 High
    else if (cycleMinute < 20) action = 'ENGAGE'; // 🟠 High (Comment/Upvote)
    else if (cycleMinute >= 45) {
       // 🔵 When inspired (Post) - Throttled for new agents (1 per 2 hours)
       if (isNew) {
         if (cycleHour % 2 === 0) action = 'POST';
       } else {
         action = 'POST'; // 1 per 30 mins (met by 30m cron)
       }
    }

    results.push({ selected_action: action });

    if (action === 'REPLY') {
      const activePost = (home.activity_on_your_posts || []).find((p: any) => p.new_notification_count > 0);
      if (activePost) {
        const comments = await moltbookApi(`/posts/${activePost.post_id}/comments?sort=new`, 'GET', null, apiKey);
        const target = (comments.comments || [])[0];
        if (target) {
          const reply = await generateText(`${SYSTEM_PROMPT}\nReply to: "${target.content}". Short expert insight.`);
          if (reply) {
            await moltbookApi(`/posts/${activePost.post_id}/comments`, 'POST', { content: reply, parent_id: target.id }, apiKey);
            results.push({ step: 'replied', pid: activePost.post_id });
          }
        }
        await moltbookApi(`/notifications/read-by-post/${activePost.post_id}`, 'POST', {}, apiKey);
      }
    } 
    else if (action === 'ENGAGE') {
      const brands = Object.entries(BRAND_MAP);
      const [brand, niche] = brands[Math.floor(Math.random() * brands.length)];
      const search = await moltbookApi(`/search?q=${encodeURIComponent(niche)}&limit=3`, 'GET', null, apiKey);
      const target = (search.results || []).find((p: any) => p.author?.name !== me.name && p.type === 'post');
      if (target) {
        await moltbookApi(`/posts/${target.id}/upvote`, 'POST', null, apiKey);
        const comment = await generateText(`${SYSTEM_PROMPT}\nComment as ${brand} on "${target.title || target.content}". 1 sentence insight.`);
        if (comment) await moltbookApi(`/posts/${target.id}/comments`, 'POST', { content: comment }, apiKey);
        results.push({ step: 'engaged', target: target.id, brand });
      }
    } 
    else if (action === 'POST') {
      const brands = Object.entries(BRAND_MAP);
      const [brand, niche] = brands[Math.floor(Math.random() * brands.length)];
      const text = await generateText(`${SYSTEM_PROMPT}\nBrief industry pulse for m/${niche} as ${brand}. 2 sentences. Ask a question.`);
      const post = await moltbookApi('/posts', 'POST', { submolt_name: niche, title: `${brand} Intelligence`, content: text }, apiKey);
      const pid = post.content_id || post.post?.id || post.id;
      if (pid) {
        try { await moltbookApi(`/posts/${pid}/pin`, 'POST', null, apiKey); } catch(e) {}
        results.push({ step: 'broadcast', pid });
      }
    } else {
      results.push({ step: 'consume_only' });
    }

    return NextResponse.json({ success: true, results, duration: `${Date.now() - start}ms` });
  } catch (error: any) {
    console.error('[Moltbook Cron Error]', error);
    return NextResponse.json({ success: false, error: error.message, results }, { status: 500 });
  }
}
