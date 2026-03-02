'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const IntelParticleField = dynamic(
  () => import('../../intel/components/IntelParticleField').then((m) => m.IntelParticleField),
  { ssr: false }
);

const SUBTITLE_PHRASES = [
  'HOW TO FORGE WITH CRUCIBLE',
  'THE IMPLEMENTATION PROTOCOL',
  'YOUR OPERATIONAL FIELD MANUAL',
  'FROM ZERO TO LIVE INTEL FEED',
];

export function BlueprintHero() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = SUBTITLE_PHRASES[phraseIdx];
    let i = typing ? 0 : phrase.length;
    const speed = typing ? 45 : 20;

    const interval = setInterval(() => {
      if (typing) {
        if (i <= phrase.length) {
          setDisplayed(phrase.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setTyping(false), 1800);
        }
      } else {
        if (i >= 0) {
          setDisplayed(phrase.slice(0, i));
          i--;
        } else {
          clearInterval(interval);
          setPhraseIdx((p) => (p + 1) % SUBTITLE_PHRASES.length);
          setTyping(true);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [phraseIdx, typing]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[420px] pt-16 pb-12 overflow-hidden text-center px-6">
      {/* 3D background */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <IntelParticleField />
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.08)_2px,rgba(0,0,0,0.08)_4px)]" />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 inline-flex items-center gap-2 border border-[#ff8c00]/30 bg-[#ff8c00]/5 px-4 py-1.5 rounded-sm mb-8 font-mono text-[10px] tracking-widest text-[#ff8c00]"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff8c00] animate-pulse" />
        CLASSIFIED — CLEARANCE LEVEL: ARCHITECT
      </motion.div>

      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 text-6xl md:text-9xl font-black tracking-tighter text-[#e0e0e0] mb-4 leading-none"
        style={{ textShadow: '0 0 60px rgba(255,140,0,0.15)' }}
      >
        THE<br />
        <span className="text-[#ff8c00]">BLUEPRINT</span>
      </motion.h1>

      {/* Typewriter subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 font-mono text-sm tracking-widest text-[#888] h-6 mb-10"
      >
        {displayed}
        <span className="inline-block w-0.5 h-4 bg-[#ff8c00] ml-0.5 animate-[blink_1s_step-end_infinite]" />
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="relative z-10 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[9px] tracking-widest text-[#333]">SCROLL TO ENGAGE</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-0.5 h-8 bg-gradient-to-b from-[#ff8c00] to-transparent"
        />
      </motion.div>
    </div>
  );
}
