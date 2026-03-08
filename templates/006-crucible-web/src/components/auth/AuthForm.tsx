'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmail } from '@/lib/auth-utils';
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signInWithEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="brick p-8 relative overflow-hidden group"
          >
            {/* Industrial Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff8c00] opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Forge Identity</h2>
              <p className="text-sm font-mono text-[#888] tracking-widest uppercase">Crucible Core Authentication</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-mono text-[#aaa] tracking-[0.2em] uppercase">
                  Broadcast Frequency (Email)
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#555] group-focus-within/input:text-[#ff8c00] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@crucible.core"
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg py-3 pl-12 pr-4 text-white font-mono text-sm placeholder:text-[#333] focus:outline-none focus:border-[#ff8c00]/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-mono"
                >
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group/btn overflow-hidden rounded-lg bg-[#111] border border-[#ff8c00]/30 py-4 transition-all hover:border-[#ff8c00]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c00]/0 via-[#ff8c00]/10 to-[#ff8c00]/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10 font-black text-white tracking-[0.3em] uppercase flex items-center justify-center gap-3">
                  {isLoading ? (
                    <Loader2 className="animate-spin text-[#ff8c00]" size={20} />
                  ) : (
                    <>
                      Initialize Connection
                      <ArrowRight size={18} className="text-[#ff8c00] transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#2a2a2a] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/50" />
                <span className="text-[9px] font-mono text-[#555] tracking-widest uppercase">Encrypted Neural Link</span>
              </div>
              <p className="text-[10px] font-mono text-[#444] leading-relaxed uppercase">
                We'll send a magic link to your frequency. Check your inbox to verify your identity.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="auth-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="brick p-12 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-[#00ff88]/10 rounded-full border border-[#00ff88]/30">
                <CheckCircle2 className="text-[#00ff88]" size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Signal Broadcasted</h2>
            <p className="font-mono text-sm text-[#888] mb-8 leading-relaxed uppercase tracking-wider">
              We've sent a neural verification link to <span className="text-white">{email}</span>. Click the link to complete the forge.
            </p>
            <div className="p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded italic font-mono text-[10px] text-[#555]">
              // Connection pending... waiting for neural confirmation
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
