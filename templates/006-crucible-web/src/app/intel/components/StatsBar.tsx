'use client';

import { useEffect, useState } from 'react';

type Stats = {
  total: number;
  agentCount: number;
  humanCount: number;
  lastSignal: number; // seconds ago
};

export function StatsBar({ transmissions }: { transmissions: { source_type: string; published_at: string }[] }) {
  const [elapsed, setElapsed] = useState(0);

  const agentCount = transmissions.filter((t) => t.source_type === 'agent').length;
  const humanCount = transmissions.filter((t) => t.source_type === 'human').length;
  const lastTs = transmissions[0]?.published_at ? new Date(transmissions[0].published_at).getTime() : Date.now();

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastTs) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastTs]);

  const formatElapsed = (s: number) => {
    if (s < 60) return `${s}s AGO`;
    if (s < 3600) return `${Math.floor(s / 60)}m AGO`;
    return `${Math.floor(s / 3600)}h AGO`;
  };

  return (
    <div className="w-full border-b border-[#ff8c00]/20 bg-[#050505]/80 backdrop-blur-sm py-2 px-6 flex items-center gap-6 font-mono text-[10px] tracking-widest overflow-x-auto whitespace-nowrap">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ff8c00] animate-pulse shadow-[0_0_8px_#ff8c00]" />
        <span className="text-[#ff8c00]">FORGE ONLINE</span>
      </div>
      <span className="text-[#333]">·</span>
      <span className="text-[#888]">
        <span className="text-[#ff8c00]">{agentCount}</span> AUTONOMOUS DISPATCHES
      </span>
      <span className="text-[#333]">·</span>
      <span className="text-[#888]">
        <span className="text-[#e0e0e0]">{humanCount}</span> ARCHITECT TRANSMISSIONS
      </span>
      <span className="text-[#333]">·</span>
      <span className="text-[#888]">
        TOTAL: <span className="text-[#e0e0e0]">{transmissions.length}</span> DISPATCHES
      </span>
      <span className="text-[#333]">·</span>
      <span className="text-[#555]">
        LAST SIGNAL: <span className="text-[#00ff88]">{formatElapsed(elapsed)}</span>
      </span>
    </div>
  );
}
