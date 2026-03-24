import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateText } from '@/lib/ai-router';

// VERCEL HOBBY: 10s timeout limit.
export const maxDuration = 60; 

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

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
  
  // If verification is needed, solve it. To save time, we return the verify result directly.
  if (data.verification_required && data.verification) {
    const { verification_code, challenge_text } = data.verification;
    // Ultra-fast prompt
    const answer = await generateText(`Solve math in 2 decimals: "${challenge_text}"`);
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

    // Optimization: Call /home first to see if we even need to work.
    const home = await moltbookApi('/home', 'GET', null, apiKey);
    const me = home.your_account;
    const unread = me.unread_notification_count || 0;
    results.push({ step: 'init', name: me.name, unread });

    const tasks = ['REPLY', 'ENGAGE', 'POST'];
    const now = new Date();
    let action = unread > 0 ? 'REPLY' : tasks[Math.floor(now.getTime() / (1000 * 60 * 30)) % tasks.length];
    
    // Safety throttle for engagement frequency
    if (action === 'ENGAGE' && now.getMinutes() > 15) action = 'IDLE';

    results.push({ action });

    if (action === 'REPLY') {
      const active = (home.activity_on_your_posts || []).find((p: any) => p.new_notification_count > 0);
      if (active) {
        const comments = await moltbookApi(`/posts/${active.post_id}/comments?sort=new`, 'GET', null, apiKey);
        const target = (comments.comments || [])[0];
        if (target) {
          const reply = await generateText(`1-sentence analytical reply to: "${target.content}". No crypto.`);
          if (reply) {
            const res = await moltbookApi(`/posts/${active.post_id}/comments`, 'POST', { content: reply, parent_id: target.id }, apiKey);
            results.push({ step: 'replied', id: res.content_id || res.id });
          }
        }
        await moltbookApi(`/notifications/read-by-post/${active.post_id}`, 'POST', {}, apiKey);
      }
    } 
    else if (action === 'ENGAGE') {
      const niche = 'forge-hq'; // Simplified for speed
      const search = await moltbookApi(`/search?q=${niche}&limit=3`, 'GET', null, apiKey);
      const target = (search.results || []).find((p: any) => p.author?.name !== me.name && p.type === 'post');
      if (target) {
        await moltbookApi(`/posts/${target.id}/upvote`, 'POST', null, apiKey);
        const comm = await generateText(`1-sentence expert comment on "${target.title || target.content}". No crypto.`);
        if (comm) await moltbookApi(`/posts/${target.id}/comments`, 'POST', { content: comm }, apiKey);
        results.push({ step: 'engaged', target: target.id });
      }
    } 
    else if (action === 'POST') {
      const type = ['forge-hq', 'forge-trends', 'forge-saas'][now.getHours() % 3];
      const text = await generateText(`200char industry brief for m/${type}. Analytical. Question? No crypto.`);
      const post = await moltbookApi('/posts', 'POST', { submolt_name: type, title: `Intelligence Update`, content: text }, apiKey);
      const pid = post.content_id || post.post?.id || post.id;
      if (pid) {
        try { await moltbookApi(`/posts/${pid}/pin`, 'POST', null, apiKey); } catch (e) {}
        results.push({ step: 'posted', pid });
      }
    }

    return NextResponse.json({ success: true, results, duration: `${Date.now() - start}ms` });
  } catch (error: any) {
    console.error('[Moltbook Cron Error]', error);
    return NextResponse.json({ success: false, error: error.message, results }, { status: 500 });
  }
}
