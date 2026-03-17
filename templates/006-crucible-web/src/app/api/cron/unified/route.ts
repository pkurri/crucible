import { NextResponse } from 'next/server';
import { GET as generateArticles } from '../../articles/generate-batch/route';
import { GET as moltbookAutomation } from '../../moltbook/automation/route';

export const maxDuration = 300; // 5 min for Vercel

/**
 * Unified Master Automation Route
 * Since Vercel Hobby plan only allows ONE cron job per day,
 * we combine all automated tasks into this single entry point.
 */
export async function GET(request: Request) {
  const results: any = {
    articles: null,
    moltbook: null,
    timestamp: new Date().toISOString()
  };

  try {
    console.log('[MASTER CRON] Starting Unified Automation...');

    // 1. Run Article Generation
    try {
      const articleRes = await generateArticles(request);
      results.articles = await articleRes.json();
      console.log('[MASTER CRON] Article generation complete.');
    } catch (e: any) {
      results.articles = { error: e.message };
      console.error('[MASTER CRON] Article generation failed:', e.message);
    }

    // 2. Run Moltbook Automation
    try {
      const moltRes = await moltbookAutomation(request);
      results.moltbook = await moltRes.json();
      console.log('[MASTER CRON] Moltbook automation complete.');
    } catch (e: any) {
      results.moltbook = { error: e.message };
      console.error('[MASTER CRON] Moltbook automation failed:', e.message);
    }

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error: any) {
    console.error('[MASTER CRON] Critical Failure:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
