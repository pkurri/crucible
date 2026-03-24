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
      const firmsKey = process.env.FIRMS_MAP_KEY || '1c17545ae03647879529cc9242a3db52'; 
      
      // NASA FIRMS returns CSV format, not JSON. Using area endpoint to get summary string.
      const res = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${firmsKey}/VIIRS_SNPP_NRT/world/1`);
      
      if (!res.ok) throw new Error('FIRMS API unavailable');
      const textData = await res.text();
      
      // Split by lines, minus the header
      const lines = textData.split('\n').filter(l => l.trim().length > 0);
      const fireCount = Math.max(0, lines.length - 1); 

      return [{
        id: `nasa-fire-count-${Date.now()}`,
        source: 'firms',
        category: 'news',
        title: `Global Fire Count: ${fireCount} Detections`,
        content: `NASA FIRMS detected ${fireCount} VIIRS fire hotspots globally in the last 24h. Tracking thermal anomalies across 7 continents.`,
        severity: (fireCount > 50000) ? 'critical' : (fireCount > 30000) ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        metadata: { count: fireCount }
      }];
    } catch (e) {
      console.warn('[INTEL] FIRMS fetch failed or unavailable');
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
      const symbols = ['^GSPC', '^IXIC', 'BTC-USD', 'ETH-USD', '^VIX'];
      const res = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`);
      const data = await res.json();
      
      const results = data.quoteResponse?.result || [];
      return results.map((q: any) => ({
        id: `mkt-${q.symbol}-${Date.now()}`,
        source: 'yfinance',
        category: 'market',
        title: `${q.shortName || q.symbol}: ${q.regularMarketPrice ?? 'N/A'}`,
        content: `Market shift for ${q.shortName || q.symbol}. Change: ${(q.regularMarketChangePercent || 0).toFixed(2)}%. Vol: ${q.regularMarketVolume || 'N/A'}`,
        severity: Math.abs(q.regularMarketChangePercent || 0) > 3 ? 'high' : 'low',
        timestamp: new Date().toISOString(),
        metadata: { price: q.regularMarketPrice, change: q.regularMarketChangePercent }
      }));
    } catch (e) {
      console.warn('[INTEL] Market data unavailable (Rate Limited or Change)');
      return [];
    }
  }

  private async fetchNews(): Promise<IntelSignal[]> {
    try {
      const res = await fetch('https://api.gdeltproject.org/api/v2/summary/summary?format=json&query=ai%20technology&mode=trend');
      if (!res.ok) throw new Error('Unreachable');
      const data = await res.json();
      
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
      console.warn('[INTEL] News fetch timed out');
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
      const { error } = await supabase.from('world_events').insert(signals.map(s => ({
        source: s.source,
        category: s.category,
        title: s.title,
        content: s.content,
        severity: s.severity,
        metadata: s.metadata || {}
      })));
      if (error) console.error('[INTEL] Save World Events failed:', error);
    }
    
    const { error: eventError } = await supabase.from('forge_events').insert({
      event_type: 'INTEL_SWEEP',
      message: `Sweep complete: ${signals.length} signals. ${delta.new_signals_count} new detections since last scan.`,
      agent_id: 'watcher-prime'
    });
    if (eventError) console.error('[INTEL] Save Forge Event failed:', eventError);
  }
}
