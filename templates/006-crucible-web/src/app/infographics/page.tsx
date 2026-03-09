'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Activity, Zap, Database, TrendingUp, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function InfographicsPage() {
  const [infographics, setInfographics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('forge_infographics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setInfographics(data);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen pt-12 pb-24">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="mb-12 border-b border-[#2a2a2a] pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-[#e0e0e0] mb-4 tracking-tight flex items-center gap-4">
              <PieChart className="w-12 h-12 md:w-16 md:h-16 text-[#ff8c00]" />
              DATA INTEL
            </h1>
            <p className="font-mono text-[#ff8c00] text-sm tracking-widest uppercase flex items-center gap-3">
              <span className="w-2 h-2 bg-[#ff8c00] animate-pulse rounded-full"></span>
              Autonomous Market Infographics & Trend Analysis
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                // Manually trigger the cron job for testing
                fetch('/api/infographics/generate-batch').then(() => window.location.reload());
              }}
              className="px-6 py-3 bg-[#111] hover:bg-[#222] text-white font-mono text-xs tracking-widest border border-[#ff8c00]/30 transition-all flex items-center gap-2 hover:border-[#ff8c00]"
            >
              <Zap className="w-4 h-4 text-[#ff8c00]" /> FORCE GENERATOR SYNC
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#ff8c00]">
            <Activity className="w-12 h-12 animate-spin mb-4" />
            <span className="font-mono text-sm tracking-widest animate-pulse">EXTRACTING TELEMETRY...</span>
          </div>
        ) : infographics.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-[#333] rounded-xl bg-[#0a0a0a]">
            <Database className="w-16 h-16 text-[#333] mx-auto mb-4" />
            <h3 className="text-2xl font-black text-[#888] mb-2 uppercase">No Data Intel Found</h3>
            <p className="font-mono text-[#555] text-sm tracking-wide">
              The automated generator has not processed any trends yet. Click "Force Generator Sync" to begin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {infographics.map((item) => (
              <InfographicCard 
                key={item.id} 
                item={item} 
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function InfographicCard({ item, isExpanded, onToggle }: { item: any; isExpanded: boolean; onToggle: () => void }) {
  // item.content is JSON stored as text or jsonb
  let content = item.content;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch {
      content = { title: item.title, subtitle: '', dataPoints: [], conclusion: '' };
    }
  }

  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      role="button"
      onClick={onToggle}
      className="group bg-[#0a0a0c] border border-[#1a1a1a] hover:border-[#ff8c00]/40 rounded-xl overflow-hidden cursor-pointer transition-all shadow-lg hover:shadow-[0_0_40px_rgba(255,140,0,0.05)]"
    >
      <div className="p-8 border-b border-[#1a1a1a] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[200%] bg-gradient-to-l from-[#ff8c00]/5 to-transparent pointer-events-none rotate-12" />
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] text-[#ff8c00] tracking-widest px-2 py-1 bg-[#ff8c00]/10 border border-[#ff8c00]/20 rounded">
              {item.domain.toUpperCase()}
            </span>
            <span className="text-xs font-mono tracking-widest text-[#666]">
              {date}
            </span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-2 group-hover:text-[#ff8c00] transition-colors">{content.title || item.title}</h2>
          <p className="text-[#888] font-mono text-sm leading-relaxed">{content.subtitle}</p>
        </div>

        <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-[#111] border border-[#222] rounded-full group-hover:bg-[#ff8c00]/10 group-hover:border-[#ff8c00]/30 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5 text-[#888] group-hover:text-[#ff8c00]" /> : <ChevronDown className="w-5 h-5 text-[#888] group-hover:text-[#ff8c00]" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 bg-[#050505]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {content.dataPoints?.map((point: any, idx: number) => (
                  <div key={idx} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-lg relative overflow-hidden group/point hover:border-[#ff8c00]/20 transition-colors">
                    <TrendingUp className="absolute top-4 right-4 w-12 h-12 text-[#111] group-hover/point:text-[#ff8c00]/5 transition-colors" />
                    <div className="text-4xl font-black text-[#e0e0e0] mb-2">{point.value}</div>
                    <div className="font-mono text-[#ff8c00] text-xs tracking-widest uppercase mb-3">{point.label}</div>
                    <p className="text-[#888] text-sm leading-relaxed">{point.description}</p>
                  </div>
                ))}
              </div>

              {content.conclusion && (
                <div className="flex items-start gap-4 p-5 bg-[#ff8c00]/5 border border-[#ff8c00]/10 rounded-lg">
                  <Bot className="w-6 h-6 text-[#ff8c00] shrink-0" />
                  <div>
                    <span className="block font-mono text-[10px] text-[#ff8c00] tracking-widest uppercase mb-1">AI Analyst Conclusion</span>
                    <p className="text-[#e0e0e0] text-sm leading-relaxed">{content.conclusion}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
