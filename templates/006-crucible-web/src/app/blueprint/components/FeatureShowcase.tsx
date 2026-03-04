'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Shield, Radio, Hammer, Menu, Zap, Database, Bot } from 'lucide-react';

const FEATURES = [
  {
    id: 'armory',
    icon: Shield,
    label: 'THE ARMORY',
    sublabel: '/',
    color: '#ff8c00',
    tagline: 'Production-Grade Template Library',
    desc: 'Browse, preview, and deploy battle-tested AI templates. Each template ships with a full skill pack, test suite, and deployment config.',
    bullets: [
      'Filterable by stack and complexity',
      'Live preview in THE STAGE',
      'One-click clone and deploy',
    ],
    glyph: '◈',
  },
  {
    id: 'intel',
    icon: Radio,
    label: 'INTEL',
    sublabel: '/intel',
    color: '#ff8c00',
    tagline: 'Live Autonomous Forge Feed',
    desc: 'Real-time stream of transmissions from both human architects and autonomous agents. DNA Provenance Strips distinguish the source instantly.',
    bullets: [
      'Supabase Realtime — zero polling',
      'Amber = Agent, Silver = Human',
      'Masonry heat-signature grid layout',
    ],
    glyph: '⬡',
  },
  {
    id: 'foundry',
    icon: Hammer,
    label: 'THE FOUNDRY',
    sublabel: '/foundry',
    color: '#ff8c00',
    tagline: 'The Factory Floor Experience',
    desc: 'Meet the forge operators. An interactive diorama of team stations with three.js visuals, conveyor-belt navigation, and blueprint corner-cuts.',
    bullets: [
      '3D wireframe forge ingot hero',
      'Horizontal scroll conveyor rail',
      'Industrial spec-sheet manifest',
    ],
    glyph: '▲',
  },
  {
    id: 'rail',
    icon: Menu,
    label: 'FORGE RAIL',
    sublabel: 'Sidebar',
    color: '#00ff88',
    tagline: 'Command Rail Navigation',
    desc: 'The collapsible side-rail replaces all top-nav. Collapse to icon-only mode — content area padding syncs live via AppShell state.',
    bullets: [
      'Expands/collapses with chevron toggle',
      'Active amber indicator strip per route',
      'CORE ONLINE pulsing status dot',
    ],
    glyph: '≡',
  },
  {
    id: 'agents',
    icon: Bot,
    label: 'SWARM AGENTS',
    sublabel: '/agents',
    color: '#ff8c00',
    tagline: 'Autonomous Forge Workers',
    desc: 'Background workers that continuously test, benchmark, and publish findings as Intel transmissions. The forge never sleeps.',
    bullets: [
      'autonomous-forge.ts worker',
      'Publishes via Supabase insert',
      'Configurable publish intervals',
    ],
    glyph: '◎',
  },
  {
    id: 'flux',
    icon: Zap,
    label: 'FLUX',
    sublabel: '/flux',
    color: '#ff8c00',
    tagline: 'Real-Time Event Stream',
    desc: 'Watch agent events fire in real time. Every template run, benchmark score, and skill invocation surfaces as a flux event.',
    bullets: [
      'Live event log with filters',
      'WebSocket-powered stream',
      'Severity-coded event rows',
    ],
    glyph: '⚡',
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-[#050505] border border-[#1a1a1a] p-6 overflow-hidden cursor-pointer group"
      style={{ borderRadius: 0 }}
    >
      {/* Blueprint corner cuts */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-[#0a0a0a] border-l-[20px] border-l-transparent" />
      <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[16px] border-b-[#0a0a0a] border-r-[16px] border-r-transparent" />

      {/* Hover glow border */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 border pointer-events-none"
        style={{ borderColor: `${feature.color}40` }}
      />

      {/* Scanline on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ top: 0 }}
            animate={{ top: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute left-0 right-0 h-px pointer-events-none z-10"
            style={{ backgroundColor: `${feature.color}60` }}
          />
        )}
      </AnimatePresence>

      {/* Large glyph bg */}
      <div
        className="absolute top-4 right-6 text-7xl font-black select-none pointer-events-none transition-opacity duration-300"
        style={{ color: hovered ? `${feature.color}18` : `${feature.color}08` }}
      >
        {feature.glyph}
      </div>

      {/* Icon */}
      <div
        className="inline-flex items-center justify-center w-10 h-10 border mb-4 transition-colors duration-200"
        style={{ borderColor: `${feature.color}30`, color: hovered ? feature.color : '#888' }}
      >
        <Icon size={18} strokeWidth={1.5} />
      </div>

      {/* Labels */}
      <div className="flex items-baseline gap-3 mb-1">
        <h3 className="font-black text-base tracking-widest text-[#e0e0e0]">{feature.label}</h3>
        <code className="font-mono text-[9px] text-[#888]">{feature.sublabel}</code>
      </div>
      <p className="font-mono text-[10px] tracking-widest mb-3" style={{ color: feature.color }}>
        {feature.tagline}
      </p>
      <p className="text-sm text-[#888] leading-relaxed mb-4">{feature.desc}</p>

      {/* Bullets */}
      <ul className="space-y-1.5">
        {feature.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 font-mono text-[11px] text-[#aaa]">
            <span style={{ color: feature.color }} className="mt-0.5">›</span>
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function FeatureShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-[#1a1a1a]">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-16"
      >
        <p className="font-mono text-[10px] tracking-widest text-[#ff8c00] mb-4">// SYSTEM MODULES</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#e0e0e0]">
          WHAT'S IN THE FORGE
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#111]">
        {FEATURES.map((f, i) => (
          <div key={f.id} className="bg-[#0a0a0a]">
            <FeatureCard feature={f} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
