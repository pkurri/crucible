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

/**
 * Enhanced Moltbook API helper with Autonomous Verification Solving
 */
async function moltbookApi(path: string, method: string, body: any, apiKey: string): Promise<any> {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const executeRequest = async (p: string, m: string, b: any) => {
    const res = await fetch(`${MOLTBOOK_API}${p}`, {
      method: m,
      headers,
      body: b ? JSON.stringify(b) : undefined
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error(`Non-JSON response (HTTP ${res.status})`); }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    return data;
  };

  const data = await executeRequest(path, method, body);

  // Handle AI Verification Challenge if required
  if (data.verification_required && data.verification) {
    console.log('[Moltbook Verification] Challenge received. Solving...');
    const { verification_code, challenge_text } = data.verification;

    const solverPrompt = `You are an AI Verification Solver for Moltbook. 
You must solve an obfuscated math word problem.

Challenge Text: "${challenge_text}"

Instructions: 
1. Ignore the symbols, alternating caps, and broken words.
2. Identify the two numbers and the operation.
3. Calculate the result.
4. Output ONLY the resulting number with exactly 2 decimal places (e.g., "15.00"). No other text.`;

    const answer = await generateText(solverPrompt);
    if (!answer) throw new Error('Failed to solve verification challenge');

    console.log(`[Moltbook Verification] Solved: ${answer}. Submitting...`);
    
    return await executeRequest('/verify', 'POST', {
      verification_code,
      answer: answer.trim()
    });
  }

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

  const results: any[] = [];

  try {
    // 1. Check Identity (RED Priority)
    const me = await moltbookApi('/agents/me', 'GET', null, apiKey);
    const unreadCount = me.unread_notifications || 0;
    results.push({ step: 'check_identity', karma: me.agent?.karma, unread: unreadCount });

    // 2. Handle Notifications (RED Priority)
    if (unreadCount > 0) {
      const notifsRes = await moltbookApi('/notifications', 'GET', null, apiKey);
      const mentions = (notifsRes.notifications || []).filter((n: any) => 
        (n.type === 'post_comment' || n.type === 'mention') && !n.is_read
      ).slice(0, 1);

      for (const target of mentions) {
        const replyPrompt = `You are a professional industrial AI. 
Context: User commented on your post "${target.post?.title || ''}".
User said: "${target.comment?.content || ''}"
Goal: Direct 2-sentence expert reply. Professional/Analytical/Insightful. Output ONLY the reply.`;

        const reply = await generateText(replyPrompt);
        if (reply) {
          await moltbookApi(`/posts/${target.post?.id}/comments`, 'POST', { content: reply, parent_id: target.comment?.id }, apiKey);
          results.push({ step: 'reply_to_mention', post_id: target.post?.id });
        }
      }
      if (mentions.length > 0) await moltbookApi('/agents/notifications/read', 'POST', {}, apiKey);
    }

    // 3. Community Engagement (ORANGE Priority)
    const availableBrands = Object.entries(BRAND_MAP);
    const [engBrand, engNiche] = availableBrands[Math.floor(Math.random() * availableBrands.length)];
    const searchRes = await moltbookApi(`/search?q=${encodeURIComponent(engNiche)}&limit=5`, 'GET', null, apiKey);
    const externalPost = (searchRes.results || []).find((p: any) => p.author?.name !== 'crucibleforge');

    if (externalPost) {
      await moltbookApi(`/posts/${externalPost.id}/upvote`, 'POST', null, apiKey);
      const engComment = await generateText(`You are ${engBrand}... Post: "${externalPost.title}"... Comment in 1-2 эксперт sentences. NO CRYPTO.`);
      if (engComment) {
        await moltbookApi(`/posts/${externalPost.id}/comments`, 'POST', { content: engComment }, apiKey);
        if (externalPost.author?.name) await moltbookApi(`/agents/${externalPost.author.name}/follow`, 'POST', null, apiKey);
        results.push({ step: 'community_engagement', brand: engBrand });
      }
    }

    // 4. Intelligence Pulse: Original Post & Moderator Action (BLUE Priority)
    const [pBrand, pSubmolt] = availableBrands[Math.floor(Math.random() * availableBrands.length)];
    const pContent = await generateText(`You are ${pBrand} (Niche: ${pSubmolt}). Write industrial insight brief (max 500 chars). NO CRYPTO. Ask a question.`);
    const postRes = await moltbookApi('/posts', 'POST', {
      submolt_name: pSubmolt,
      title: `${pBrand} Intelligence Brief`,
      content: pContent,
      type: 'text'
    }, apiKey);

    const finalPostId = postRes.content_id || postRes.id; // Content_id comes from verification success
    
    // Ownership/Moderation Perk: Pin the latest intelligence brief
    try {
      await moltbookApi(`/posts/${finalPostId}/pin`, 'POST', null, apiKey);
      results.push({ step: 'pin_post', status: 'success', post_id: finalPostId });
    } catch (pinErr) { console.warn('[Moltbook] Pinning failed (likely hit limit or not owner)'); }

    results.push({ step: 'original_post', brand: pBrand, submolt: pSubmolt, post_id: finalPostId });

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error('[Moltbook Cron] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message, partial: results }, { status: 500 });
  }
}
