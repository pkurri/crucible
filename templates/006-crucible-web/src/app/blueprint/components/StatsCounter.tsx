'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { value: 8, label: 'FORGE ROUTES', suffix: '', color: '#ff8c00' },
  { value: 3, label: 'LIVE 3D SCENES', suffix: '', color: '#ff8c00' },
  { value: 2, label: 'REALTIME CHANNELS', suffix: '', color: '#ff8c00' },
  { value: 100, label: 'SSR COMPATIBLE', suffix: '%', color: '#00ff88' },
];

function CountUp({ to, suffix, color, active }: { to: number; suffix: string; color: string; active: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1200;
    const steps = 40;
    const increment = to / steps;
    const stepDuration = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [active, to]);

  return (
    <span style={{ color }}>
      {count}{suffix}
    </span>
  );
}

export function StatsCounter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="border-y border-[#1a1a1a] bg-[#050505] py-16"
    >
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#0f0f0f]">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.4 }}
            className="bg-[#050505] px-8 py-8 text-center"
          >
            <div className="text-5xl font-black tracking-tighter mb-2">
              <CountUp to={stat.value} suffix={stat.suffix} color={stat.color} active={inView} />
            </div>
            <div className="font-mono text-[9px] tracking-widest text-[#333]">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
