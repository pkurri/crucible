import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateText } from '@/lib/ai-router';

/**
 * ULTRA-LEAN PERFORMANCE V2 (10s LIMIT SURVIVAL)
 * 
 * To survive Vercel Hobby's 10s timeout, this pinger now performs 
 * EXACTLY ONE major action per 30m cycle:
 * 1. IF unread notifications > 0 -> REPLY ONLY (Skill.md Priority Red)
 * 2. ELSE -> POST ONLY (Skill.md Priority Blue)
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

async function moltbookApi(path: string, method: string, body: any, apiKey: string): Promise<any> {
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const req = async (p: string, m: string, b: any) => {
    // 5s timeout per internal API call to prevent cascade failure
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${MOLTBOOK_API}${p}`, { 
        method: m, headers, cache: 'no-store', body: b ? JSON.stringify(b) : undefined,
        signal: controller.signal 
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(`Non-JSON HTTP ${res.status}`); }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
      return data;
    } finally {
      clearTimeout(id);
    }
  };

  const data = await req(path, method, body);
  // Auto-solve verification challenges
  if (data.verification_required && data.verification) {
    const { verification_code, challenge_text } = data.verification;
    const answer = await generateText(`Solve math in 2 decimals: "${challenge_text}"`);
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

    // Step 1: Rapid Dashboard Check
    const home = await moltbookApi('/home', 'GET', null, apiKey);
    const unreadCount = home.your_account?.unread_notification_count || 0;
    const createdAt = home.your_account?.created_at;
    const isEstablished = createdAt ? (Date.now() - new Date(createdAt).getTime()) > 86400000 : false;
    
    results.push({ step: 'home', unread: unreadCount, isEstablished });

    // Step 2: EXCLUSIVE TASK SELECTION (Survive 10s)
    if (unreadCount > 0) {
      // TASK: REPLY (Highest Priority)
      const active = (home.activity_on_your_posts || []).find((p: any) => p.new_notification_count > 0);
      if (active) {
        const comments = await moltbookApi(`/posts/${active.post_id}/comments?sort=new`, 'GET', null, apiKey);
        const target = (comments.comments || [])[0];
        if (target) {
          const reply = await generateText(`Reply to: "${target.content}". Analytical industrial persona. 1 sentence. No crypto.`);
          if (reply) {
            await moltbookApi(`/posts/${active.post_id}/comments`, 'POST', { content: reply, parent_id: target.id }, apiKey);
            results.push({ task: 'reply_success', pid: active.post_id });
          }
        }
        await moltbookApi(`/notifications/read-by-post/${active.post_id}`, 'POST', {}, apiKey);
      }
    } 
    else {
      // TASK: BROADCAST (Every 30m if established, every 2h if new)
      const now = new Date();
      const shouldPost = isEstablished || (now.getHours() % 2 === 0);
      
      if (shouldPost) {
        const brands = ['CrucibleForge', 'DebtRadar', 'CVEWatcher', 'ArXivPulse', 'LegislAI', 'MicroSaaSRadar'];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const niche = 'forge-hq';
        const text = await generateText(`Expert 200char industry alert for m/${niche} as ${brand}. No crypto.`);
        const postRes = await moltbookApi('/posts', 'POST', { submolt_name: niche, title: `${brand} Intel`, content: text }, apiKey);
        const pid = postRes.content_id || postRes.post?.id || postRes.id;
        if (pid) {
          try { await moltbookApi(`/posts/${pid}/pin`, 'POST', null, apiKey); } catch(e) {}
          results.push({ task: 'post_success', pid });
        }
      } else {
        results.push({ task: 'throttle_skip' });
      }
    }

    return NextResponse.json({ success: true, results, durationMs: Date.now() - start });
  } catch (error: any) {
    console.error('[Moltbook Cron Error]', error);
    return NextResponse.json({ success: false, error: error.message, results }, { status: 500 });
  }
}
