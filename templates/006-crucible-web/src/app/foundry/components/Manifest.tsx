'use client';

import { motion } from 'framer-motion';

const specs = [
  { label: 'TOLERANCE', value: 'ZERO' },
  { label: 'ALLOY', value: 'TYPE-SAFE' },
  { label: 'HARDNESS', value: 'PRODUCTION-GRADE' },
  { label: 'TEMP RANGE', value: '-∞ TO ∞' },
  { label: 'YIELD STRENGTH', value: '99.99% UPTIME' },
  { label: 'SURFACE FINISH', value: 'OBSIDIAN-DARK' },
  { label: 'CERTIFICATIONS', value: 'AUTONOMOUS-READY' },
  { label: 'FORGE DATE', value: '2025-AD' },
];

export function Manifest() {
  return (
    <div className="mt-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-6 h-[2px] bg-[#ff8c00]" />
        <h2 className="font-mono text-[11px] tracking-[0.3em] text-[#ff8c00]">
          FORGE MANIFEST — MATERIAL SPECIFICATION
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#2a2a2a] to-transparent" />
      </div>

      {/* Spec sheet grid */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 border border-[#1a1a1a] divide-x divide-y divide-[#1a1a1a]"
      >
        {specs.map((spec, i) => (
          <motion.div
            key={spec.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="group p-5 bg-[#050505] hover:bg-[#0d0800] transition-colors duration-300"
          >
            <p className="font-mono text-[9px] tracking-widest text-[#666] mb-2">{spec.label}</p>
            <p className="font-mono text-sm font-bold text-[#ff8c00] group-hover:text-[#ffa500] transition-colors duration-200">
              {spec.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom stamp */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#2a2a2a]" />
        <div className="border border-[#333] px-4 py-2 font-mono text-[10px] text-[#666] tracking-widest">
          CRUCIBLE // ALL SYSTEMS NOMINAL
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#2a2a2a]" />
      </div>
    </div>
  );
}
