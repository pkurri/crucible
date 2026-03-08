'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff8c00]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="brick p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30">
              <AlertCircle className="text-red-500" size={48} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
            Link Expired
          </h1>
          
          <p className="font-mono text-sm text-[#888] mb-2 leading-relaxed uppercase tracking-wider">
            The verification link has expired or is invalid.
          </p>
          <p className="font-mono text-xs text-[#555] mb-8 leading-relaxed">
            // Magic links expire after 1 hour. Request a new one.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#ff8c00]/10 border border-[#ff8c00]/30 rounded text-[#ff8c00] font-mono text-xs tracking-widest hover:bg-[#ff8c00] hover:text-black transition-all"
            >
              <RefreshCw size={16} />
              REQUEST NEW LINK
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 bg-transparent border border-[#2a2a2a] rounded text-[#666] font-mono text-xs tracking-widest hover:border-[#444] hover:text-[#aaa] transition-all"
            >
              <ArrowLeft size={14} />
              BACK TO TERMINAL
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[9px] text-[#333] tracking-widest uppercase">
          CRUCIBLE AUTH GATEWAY — SECURE LINK PROTOCOL
        </p>
      </div>
    </div>
  );
}
