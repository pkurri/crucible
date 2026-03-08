'use client';

import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';
import { Link } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff8c00]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00ff88]/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="w-16 h-16 bg-[#ff8c00]/10 border-2 border-[#ff8c00]/30 flex items-center justify-center mb-6 rounded-xl shadow-[0_0_20px_rgba(255,140,0,0.1)]">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[20px] border-b-[#ff8c00] border-r-[12px] border-r-transparent animate-pulse-molten" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Crucible</h1>
          <p className="font-mono text-[#555] text-xs tracking-[0.4em] uppercase">Forging Autonomous Futures</p>
        </motion.div>

        <AuthForm />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <a
            href="/"
            className="font-mono text-[9px] text-[#444] hover:text-[#ff8c00] transition-colors uppercase tracking-[0.3em] flex items-center justify-center gap-2"
          >
            ← Back to Public Terminal
          </a>
        </motion.div>
      </div>

      {/* Industrial Footer Decor */}
      <div className="absolute bottom-8 left-8 hidden lg:block">
        <div className="font-mono text-[10px] text-[#222] tracking-widest uppercase mb-2">AUTH_GATEWAY_V1.0</div>
        <div className="w-32 h-px bg-[#111]" />
      </div>
      <div className="absolute bottom-8 right-8 hidden lg:block">
        <div className="font-mono text-[10px] text-[#222] tracking-widest uppercase mb-2 text-right">SECURE_LINK_ACTIVE</div>
        <div className="w-32 h-px bg-[#111] ml-auto" />
      </div>
    </div>
  );
}
