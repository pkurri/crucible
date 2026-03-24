import { generateText } from '../ai-router';
import { getSupabaseAdmin } from '../supabase';

/**
 * 🛠️ THE FORGE INTEL WATCHER (Crucix 2.0 Engine)
 * Orchestrates multi-source world intelligence fetching and delta computation.
 */

export interface IntelSignal {
  id: string;
  source: string;
  category: 'market' | 'news' | 'tech' | 'social';
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  metadata?: any;
}

export class IntelWatcher {
  private static instance: IntelWatcher;
  
  public static getInstance(): IntelWatcher {
    if (!IntelWatcher.instance) {
      IntelWatcher.instance = new IntelWatcher();
    }
    return IntelWatcher.instance;
  }

  /**
   * Performs a complete 'WORLD SWEEP'
   * 1. Fetches raw data from multiple sources
   * 2. Synthesizes intelligence via AI
   * 3. Computes delta from previous sweep
   * 4. Persists to Supabase + Alerts notifications
   */
  async sweep(): Promise<{ signals: IntelSignal[]; delta: any }> {
    console.log('[INTEL] Starting World Sweep...');
    
    // ─── Parallel Fetching ──────────────────────────────────────────────
    const [markets, news, github, fires, radiation] = await Promise.all([
      this.fetchMarkets(),
      this.fetchNews(),
      this.fetchGithubTrends(),
      this.fetchFires(),
      this.fetchRadiation()
    ]);

    const rawSignals = [...markets, ...news, ...github, ...fires, ...radiation];
    
    // ─── AI Synthesis ───────────────────────────────────────────────────
    const synthesized = await this.synthesize(rawSignals);
    
    // ─── Delta Tracking ────────────────────────────────────────────────
    const prevSweep = await this.getPreviousSweep();
    const delta = this.computeDelta(synthesized, prevSweep);

    // ─── Persistence ───────────────────────────────────────────────────
    await this.saveSweep(synthesized, delta);

    return { signals: synthesized, delta };
  }

  private async fetchFires(): Promise<IntelSignal[]> {
    try {
      const firmsKey = process.env.FIRMS_MAP_KEY || '1c17545ae03647879529cc9242a3db52'; // Use provided key as fallback or env
      
      // Step 1: Get count for World (last 24h)
      const countRes = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/count/v1/${firmsKey}/MODIS_C6/World/1`);
      const countData = await countRes.json();
      
      const signals: IntelSignal[] = [{
        id: `nasa-fire-count-${Date.now()}`,
        source: 'firms',
        category: 'news',
        title: `Global Fire Count: ${countData.count || 0} Detections`,
        content: `NASA FIRMS detected ${countData.count} MODIS fire hotspots globally in the last 24h. Tracking thermal anomalies across 7 continents.`,
        severity: (countData.count > 50000) ? 'critical' : (countData.count > 30000) ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        metadata: { count: countData.count }
      }];

      // Step 2: Try to get a sample of specific hotspots for the globe (optional/granular)
      // For now we'll stick to the summary to avoid rate limit complexity during the first sweep
      // but the key is now active for the count endpoint.
      
      return signals;
    } catch (e) {
      console.error('[INTEL] FIRMS fetch failed:', e);
      return [];
    }
  }

  private async fetchRadiation(): Promise<IntelSignal[]> {
    try {
      // Safecast Real-time Radiation API
      const res = await fetch('https://api.safecast.org/measurements.json?limit=5');
      const data = await res.json();
      
      return (data || []).map((m: any) => ({
        id: `safecast-${m.id}-${Date.now()}`,
        source: 'safecast',
        category: 'tech',
        title: `Radiation: ${m.value} ${m.unit}`,
        content: `Real-time sensor reading from ${m.location_name || 'Global Grid'}: ${m.value} ${m.unit}`,
        severity: m.value > 100 ? 'high' : 'low',
        timestamp: new Date(m.captured_at).toISOString(),
        metadata: { value: m.value, unit: m.unit, location: m.location_name }
      }));
    } catch (e) {
      return [];
    }
  }

  private async fetchMarkets(): Promise<IntelSignal[]> {
    try {
      // Yahoo Finance public query (Crucix method)
      const symbols = ['^GSPC', '^IXIC', 'BTC-USD', 'ETH-USD', '^VIX'];
      const res = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`);
      const { quoteResponse } = await res.json();
      
      return (quoteResponse.result || []).map((q: any) => ({
        id: `mkt-${q.symbol}-${Date.now()}`,
        source: 'yfinance',
        category: 'market',
        title: `${q.shortName || q.symbol}: ${q.regularMarketPrice}`,
        content: `Market shift for ${q.shortName}. Change: ${q.regularMarketChangePercent.toFixed(2)}%. Vol: ${q.regularMarketVolume || 'N/A'}`,
        severity: Math.abs(q.regularMarketChangePercent) > 3 ? 'high' : 'low',
        timestamp: new Date().toISOString(),
        metadata: { price: q.regularMarketPrice, change: q.regularMarketChangePercent }
      }));
    } catch (e) {
      console.error('[INTEL] Market fetch failed:', e);
      return [];
    }
  }

  private async fetchNews(): Promise<IntelSignal[]> {
    try {
      // GDELT Summary query (World Events)
      const res = await fetch('https://api.gdeltproject.org/api/v2/summary/summary?format=json&query=ai%20technology&mode=trend');
      const data = await res.json();
      
      // Pull only the top 5 trending events
      return (data.trends || []).slice(0, 5).map((t: any) => ({
        id: `news-${t.term}-${Date.now()}`,
        source: 'gdelt',
        category: 'news',
        title: `Breaking: ${t.term} Trending`,
        content: `Global news trajectory detected for term: ${t.term}. Frequency: ${t.count}`,
        severity: 'medium',
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      return [];
    }
  }

  private async fetchGithubTrends(): Promise<IntelSignal[]> {
    try {
      const res = await fetch('https://api.github.com/search/repositories?q=created:>2026-01-01&sort=stars&order=desc', {
         headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      const data = await res.json();
      
      return (data.items || []).slice(0, 3).map((repo: any) => ({
        id: `github-${repo.id}-${Date.now()}`,
        source: 'github',
        category: 'tech',
        title: `Trending: ${repo.full_name}`,
        content: repo.description || 'No description available.',
        severity: repo.stargazers_count > 1000 ? 'high' : 'low',
        timestamp: new Date().toISOString(),
        metadata: { stars: repo.stargazers_count, url: repo.html_url }
      }));
    } catch (e) {
      return [];
    }
  }

  private async synthesize(signals: IntelSignal[]): Promise<IntelSignal[]> {
    if (signals.length === 0) return [];
    
    // AI Synthesis: Correlation and importance scoring
    const prompt = `
      Act as Crucible's Master Intel Architect. Analyze these raw world signals and return a refined list.
      Identify correlations (e.g., tech trends affecting markets).
      Raw Signals: ${JSON.stringify(signals)}
      
      Return ONLY valid JSON array of objects following the IntelSignal interface.
      Ensure high-veracity scoring.
    `;
    
    try {
      const synthesis = await generateText(prompt);
      const match = synthesis.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch (e) {
      console.warn('[INTEL] AI Synthesis failed, returning raw signals');
    }
    return signals;
  }

  private async getPreviousSweep(): Promise<IntelSignal[]> {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('world_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  }

  private computeDelta(current: IntelSignal[], previous: IntelSignal[]): any {
    const newItems = current.filter(c => !previous.find(p => p.title === c.title));
    const escalations = current.filter(c => {
      const prev = previous.find(p => p.title === c.title);
      return prev && prev.severity !== c.severity;
    });

    return {
      new_signals_count: newItems.length,
      escalations_count: escalations.length,
      timestamp: new Date().toISOString()
    };
  }

  private async saveSweep(signals: IntelSignal[], delta: any) {
    const supabase = getSupabaseAdmin();
    if (signals.length > 0) {
      await supabase.from('world_events').insert(signals.map(s => ({
        ...s,
        id: undefined, // Let DB generate ID
        metadata: JSON.stringify(s.metadata || {})
      })));
    }
    
    await supabase.from('forge_events').insert({
      event_type: 'INTEL_SWEEP',
      message: `Sweep complete: ${signals.length} signals, ${delta.new_signals_count} new.`,
      agent_id: 'watcher-prime'
    });
  }
}
