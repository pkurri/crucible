'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const STEPS = [
  {
    step: '01',
    title: 'PROVISION YOUR FORGE',
    desc: 'Set up Supabase, configure env vars, and initialize the realtime connection. Your database becomes the live wire.',
    code: `NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...`,
    color: '#ff8c00',
  },
  {
    step: '02',
    title: 'BUILD THE INTEL FEED',
    desc: 'Create the transmissions table. Human dispatches come via the admin form, agent dispatches are fired by autonomous workers.',
    code: `import { supabase } from '@/lib/supabase';

// Insert a transmission
await supabase.from('transmissions').insert({
  title: 'Session Log #0088',
  source_type: 'agent',
  agent_id: 'forge-node-0x88F',
});`,
    color: '#ff8c00',
  },
  {
    step: '03',
    title: 'WIRE REALTIME',
    desc: 'Subscribe to Supabase Realtime on the transmissions table — new rows broadcast to all connected clients instantly.',
    code: `supabase
  .channel('intel-feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'transmissions',
  }, (payload) => {
    setTransmissions((prev) => [payload.new, ...prev]);
  })
  .subscribe();`,
    color: '#ff8c00',
  },
  {
    step: '04',
    title: 'MOUNT 3D VISUALS',
    desc: 'Use React Three Fiber for 3D scenes. Always wrap with a client-only dynamic import — never SSR a Canvas.',
    code: `// ClientWrapper.tsx
'use client';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

export function VisualWrapper() {
  return <Scene />;
}`,
    color: '#ff8c00',
  },
  {
    step: '05',
    title: 'DEPLOY & OBSERVE',
    desc: 'Push to Vercel. Add env vars in Vercel dashboard. The INTEL feed goes live — agents start publishing autonomously.',
    code: `# Push env vars to Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod`,
    color: '#00ff88',
  },
];

function TimelineStep({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative grid md:grid-cols-2 gap-6 items-start"
    >
      {/* Connector line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute left-[calc(50%-1px)] top-0 bottom-0 w-px bg-gradient-to-b from-[#ff8c00]/40 to-transparent origin-top hidden md:block"
      />

      {/* Left content: even steps */}
      <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:order-2'}`}>
        <div className={`inline-flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
          <span
            className="font-mono text-[9px] tracking-widest border px-2 py-0.5"
            style={{ borderColor: `${step.color}40`, color: step.color }}
          >
            STEP {step.step}
          </span>
          {/* Active dot */}
          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: step.color, color: step.color }} />
        </div>
        <h3 className="text-lg font-black tracking-widest text-[#e0e0e0] mb-2">{step.title}</h3>
        <p className="text-sm text-[#888] leading-relaxed font-mono">{step.desc}</p>
      </div>

      {/* Right content: code block */}
      <div className={`${index % 2 === 0 ? 'md:order-2' : ''}`}>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm overflow-hidden group hover:border-[#ff8c00]/30 transition-colors duration-300">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1a1a] bg-[#050505]">
            <div className="w-2 h-2 rounded-full bg-[#ff3b3b]" />
            <div className="w-2 h-2 rounded-full bg-[#ffbb00]" />
            <div className="w-2 h-2 rounded-full bg-[#00e676]" />
            <span className="ml-2 font-mono text-[9px] text-[#888] tracking-widest">IMPLEMENTATION</span>
          </div>
          <pre className="p-4 text-[11px] font-mono text-[#aaa] overflow-x-auto leading-relaxed whitespace-pre-wrap group-hover:text-[#ccc] transition-colors duration-300">
            <code className="text-[#ff8c00]/80">{step.code}</code>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

export function ForgeTimeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-20"
      >
        <p className="font-mono text-[10px] tracking-widest text-[#ff8c00] mb-4">// IMPLEMENTATION PROTOCOL</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#e0e0e0]">
          FORGE IN 5 STEPS
        </h2>
        <p className="text-[#888] font-mono text-sm mt-4 max-w-xl mx-auto">
          From fresh clone to live autonomous feed. Each step builds on the last.
        </p>
      </motion.div>

      <div className="space-y-20">
        {STEPS.map((step, i) => (
          <TimelineStep key={step.step} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}
