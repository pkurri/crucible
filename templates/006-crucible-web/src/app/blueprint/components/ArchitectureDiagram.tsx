'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const NODES = [
  { id: 'browser', label: 'BROWSER', sublabel: 'Next.js App Router', x: 10, y: 50, color: '#e0e0e0' },
  { id: 'forgerail', label: 'FORGE RAIL', sublabel: 'AppShell + ForgeRail', x: 30, y: 20, color: '#ff8c00' },
  { id: 'pages', label: 'PAGES', sublabel: 'Intel / Foundry / Blueprint', x: 30, y: 80, color: '#ff8c00' },
  { id: 'supabase', label: 'SUPABASE', sublabel: 'DB + Realtime', x: 60, y: 50, color: '#3ecf8e' },
  { id: 'agents', label: 'AGENTS', sublabel: 'autonomous-forge.ts', x: 80, y: 20, color: '#ff8c00' },
  { id: 'r3f', label: '3D SCENES', sublabel: 'R3F + Three.js', x: 80, y: 80, color: '#a78bfa' },
];

const EDGES = [
  { from: 'browser', to: 'forgerail' },
  { from: 'browser', to: 'pages' },
  { from: 'pages', to: 'supabase' },
  { from: 'supabase', to: 'agents' },
  { from: 'pages', to: 'r3f' },
  { from: 'forgerail', to: 'pages' },
];

function getPos(id: string, containerW: number, containerH: number) {
  const n = NODES.find((n) => n.id === id)!;
  return { x: (n.x / 100) * containerW, y: (n.y / 100) * containerH };
}

export function ArchitectureDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const W = 900;
  const H = 340;

  return (
    <section className="max-w-6xl mx-auto px-6 py-24 border-t border-[#1a1a1a]">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-12 text-center"
      >
        <p className="font-mono text-[10px] tracking-widest text-[#ff8c00] mb-4">// SYSTEM ARCHITECTURE</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#e0e0e0]">
          HOW IT ALL CONNECTS
        </h2>
        <p className="text-[#888] font-mono text-sm mt-4">
          From browser to database to autonomous agents — the full signal path.
        </p>
      </motion.div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-4xl mx-auto block"
          style={{ minWidth: 500 }}
        >
          {/* Edges */}
          {EDGES.map(({ from, to }, i) => {
            const a = getPos(from, W, H);
            const b = getPos(to, W, H);
            return (
              <motion.line
                key={`${from}-${to}`}
                x1={a.x} y1={a.y}
                x2={b.x} y2={b.y}
                stroke="#ff8c00"
                strokeOpacity={0.2}
                strokeWidth={1}
                strokeDasharray="4 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.8 }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node, i) => {
            const { x, y } = getPos(node.id, W, H);
            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
              >
                {/* Glow ring */}
                <circle cx={x} cy={y} r={28} fill="none" stroke={node.color} strokeOpacity={0.12} strokeWidth={8} />
                {/* Main circle */}
                <circle cx={x} cy={y} r={20} fill="#050505" stroke={node.color} strokeOpacity={0.4} strokeWidth={1} />
                {/* Label */}
                <text x={x} y={y - 32} textAnchor="middle" fill={node.color} fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="2">
                  {node.label}
                </text>
                <text x={x} y={y + 38} textAnchor="middle" fill="#888" fontSize="8" fontFamily="monospace">
                  {node.sublabel}
                </text>
              </motion.g>
            );
          })}

          {/* Pulse dots travelling along edges */}
          {inView && EDGES.slice(0, 4).map(({ from, to }, i) => {
            const a = getPos(from, W, H);
            const b = getPos(to, W, H);
            return (
              <motion.circle
                key={`pulse-${i}`}
                r={3}
                fill="#ff8c00"
                initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                animate={{
                  cx: [a.x, b.x, a.x],
                  cy: [a.y, b.y, a.y],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  delay: i * 0.6,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
