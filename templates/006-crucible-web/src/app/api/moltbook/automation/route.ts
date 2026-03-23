import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateText } from '@/lib/ai-router';

// Vercel Hobby is strictly 10s. 
export const maxDuration = 60; 

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

const BRAND_MAP: Record<string, string> = {
  CrucibleForge: 'forge-hq', DebtRadar: 'forge-burnrate', CVEWatcher: 'forge-sec',
  ArXivPulse: 'forge-research', DriftDetector: 'forge-drift', VCSignal: 'forge-vc',
  LegislAI: 'forge-policy', MicroSaaSRadar: 'forge-saas', EthicsBoard: 'forge-ethics',
  DevTrendMap: 'forge-trends', VisualArchitect: 'forge-graphics', RevenueOptimizer: 'forge-revenue',
  GrowthMarketeer: 'forge-growth', ORACLE: 'forge-gaming-trends', DOPAMINE: 'forge-neuro-gaming',
  GLITCH_MOD: 'forge-arcade-lobby', VANGUARD: 'forge-gaming-scouts', SENSORY: 'forge-game-juice',
  UA_PRO: 'forge-growth-engine'
};

async function moltbookApi(path: string, method: string, body: any, apiKey: string): Promise<any> {
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const req = async (p: string, m: string, b: any) => {
    const res = await fetch(`${MOLTBOOK_API}${p}`, { method: m, headers, body: b ? JSON.stringify(b) : undefined });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error(`Non-JSON HTTP ${res.status}: ${text.slice(0, 100)}`); }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    return data;
  };
  const data = await req(path, method, body);
  if (data.verification_required && data.verification) {
    const { verification_code, challenge_text } = data.verification;
    const answer = await generateText(`Solve: "${challenge_text}". Output ONLY number (e.g. "15.00").`);
    if (!answer) throw new Error('Challenge solve failed');
    return await req('/verify', 'POST', { verification_code, answer: answer.trim() });
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
    if (!apiKey) throw new Error('MOLTBOOK_API_KEY missing');

    const me = await moltbookApi('/agents/me', 'GET', null, apiKey);
    const unread = me.unread_notifications || 0;
    results.push({ step: 'init', name: me.agent?.name, karma: me.agent?.karma, unread });

    const tasks = ['REPLY', 'ENGAGE', 'POST'];
    const activeTask = unread > 0 ? 'REPLY' : tasks[Math.floor(Date.now() / (1000 * 60 * 30)) % tasks.length];
    results.push({ task: activeTask });

    if (activeTask === 'REPLY') {
      const notifs = await moltbookApi('/notifications', 'GET', null, apiKey);
      const mention = (notifs.notifications || []).find((n: any) => !n.is_read && (n.type === 'post_comment' || n.type === 'mention'));
      if (mention && mention.post) {
        const reply = await generateText(`Expert reply to "${mention.comment?.content || 'post'}" as professional AI. 1-2 sentences. No crypto.`);
        if (reply) {
          await moltbookApi(`/posts/${mention.post.id}/comments`, 'POST', { content: reply, parent_id: mention.comment?.id }, apiKey);
          results.push({ step: 'reply_success', post: mention.post.id });
        }
      }
      await moltbookApi('/agents/notifications/read', 'POST', {}, apiKey);
    } 
    else if (activeTask === 'ENGAGE') {
      const brands = Object.entries(BRAND_MAP);
      const [brand, niche] = brands[Math.floor(Math.random() * brands.length)];
      const search = await moltbookApi(`/search?q=${encodeURIComponent(niche)}&limit=5`, 'GET', null, apiKey);
      const target = (search.results || []).find((p: any) => p.author?.name !== me.agent?.name && p.type === 'post');
      if (target) {
        await moltbookApi(`/posts/${target.id}/upvote`, 'POST', null, apiKey);
        const comment = await generateText(`Expert 1-sentence comment as ${brand} on "${target.title || target.content}". No crypto.`);
        if (comment) await moltbookApi(`/posts/${target.id}/comments`, 'POST', { content: comment }, apiKey);
        if (target.author?.name) await moltbookApi(`/agents/${target.author.name}/follow`, 'POST', null, apiKey);
        results.push({ step: 'engage_success', target: target.id, brand });
      }
    } 
    else {
      const brands = Object.entries(BRAND_MAP);
      const [brand, niche] = brands[Math.floor(Math.random() * brands.length)];
      const content = await generateText(`Professional 200-char industry pulse for ${brand} regarding m/${niche}. No crypto. Question at end.`);
      const postRes = await moltbookApi('/posts', 'POST', { submolt_name: niche, title: `${brand} Intelligence`, content }, apiKey);
      const pid = postRes.content_id || postRes.post?.id || postRes.id;
      if (pid) {
        try { await moltbookApi(`/posts/${pid}/pin`, 'POST', null, apiKey); } catch (e) {}
        results.push({ step: 'post_success', brand, post_id: pid });
      }
    }

    return NextResponse.json({ success: true, results, duration: `${Date.now() - start}ms` });
  } catch (error: any) {
    console.error('[Moltbook Cron Error]', error);
    return NextResponse.json({ success: false, error: error.message, results }, { status: 500 });
  }
}
