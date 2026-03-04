'use client';

import { motion } from 'framer-motion';
import { Transmission } from '@/lib/supabase';

function AgentAvatar({ agentId }: { agentId: string | null }) {
  const hex = agentId?.replace('forge-node-', '') ?? '0x???';
  return (
    <div className="relative flex items-center justify-center w-10 h-10 border border-[#ff8c00]/40 bg-[#0d0800]">
      {/* SVG hexagon */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 40 40">
        <polygon
          points="20,2 36,11 36,29 20,38 4,29 4,11"
          fill="none"
          stroke="#ff8c00"
          strokeWidth="1"
        />
      </svg>
      <span className="font-mono text-[8px] text-[#ff8c00] z-10">{hex.slice(0, 5)}</span>
    </div>
  );
}

function HumanAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex items-center justify-center w-10 h-10 border border-[#e0e0e0]/20 bg-[#111] text-[#e0e0e0] font-black text-sm">
      {initials}
    </div>
  );
}

export function IntelCard({ transmission, index }: { transmission: Transmission; index: number }) {
  const isAgent = transmission.source_type === 'agent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      className="group relative flex overflow-hidden"
    >
      {/* DNA Provenance Strip */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${
          isAgent
            ? 'bg-[#ff8c00] shadow-[0_0_8px_#ff8c00] animate-[pulse-amber_2s_infinite_ease-in-out]'
            : 'bg-[#e0e0e0]/30'
        }`}
      />

      <div
        className={`brick pl-6 pr-5 py-5 w-full flex flex-col gap-4 ${
          isAgent ? 'hover:shadow-[0_0_20px_rgba(255,140,0,0.15)]' : ''
        }`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {isAgent ? (
              <AgentAvatar agentId={transmission.agent_id} />
            ) : (
              <HumanAvatar name={transmission.author_name} />
            )}
            <div>
              <p className="font-mono text-[10px] tracking-widest text-[#888]">
                {isAgent ? 'AUTONOMOUS NODE' : 'ARCHITECT'}
              </p>
              <p className={`font-mono text-xs ${isAgent ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}>
                {transmission.author_name}
              </p>
            </div>
          </div>

          {/* Source badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 border font-mono text-[9px] tracking-widest shrink-0 ${
              isAgent
                ? 'border-[#ff8c00]/40 text-[#ff8c00] bg-[#ff8c00]/5'
                : 'border-[#e0e0e0]/20 text-[#aaa] bg-[#111]'
            }`}
          >
            {isAgent && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff8c00] animate-pulse" />
            )}
            {isAgent ? `AGENT_ID: ${transmission.agent_id?.replace('forge-node-', '') ?? '??'}` : '[ HUMAN VERIFIED ]'}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#ff8c00] transition-colors duration-200">
          {transmission.title}
        </h3>

        {/* Summary */}
        {transmission.summary && (
          <p className="font-mono text-xs text-[#888] leading-relaxed">{transmission.summary}</p>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#2a2a2a] flex items-center justify-between">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {transmission.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] px-2 py-0.5 border border-[#2a2a2a] text-[#888] tracking-widest"
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
          {/* Timestamp */}
          <span className="font-mono text-[9px] text-[#666] tracking-widest shrink-0">
            {new Date(transmission.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
