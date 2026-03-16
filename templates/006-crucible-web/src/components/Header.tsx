'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth-utils';

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = getSupabase();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <nav 
      aria-label="Main Navigation" 
      className="border-b-2 border-[#ff8c00]/20 bg-[#050505]/95 backdrop-blur sticky top-0 z-50"
    >
      <div className="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div 
            aria-hidden="true" 
            className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[20px] border-b-[#ff8c00] border-r-[12px] border-r-transparent animate-pulse-molten"
          ></div>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-widest text-[#e0e0e0]">CRUCIBLE</span>
            <span className="text-[8px] text-[#333] font-mono mt-1 opacity-20">v1.2.2-single-menu</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 ml-10">
          <Link href="/pricing" className="text-[10px] font-mono tracking-widest text-[#888] hover:text-[#ff8c00] transition-colors">
            MONETIZATION
          </Link>
          <Link href="/hub" className="text-[10px] font-mono tracking-widest text-[#888] hover:text-[#ff8c00] transition-colors">
            BLUEPRINTS
          </Link>
          <Link href="/foundry" className="text-[10px] font-mono tracking-widest text-[#888] hover:text-[#ff8c00] transition-colors">
            FORGE
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Status Badge */}
          <div 
            aria-label="Core system status: Online"
            className="hidden sm:flex items-center gap-3 px-4 py-1.5 border border-[#00ff88]/30 rounded-full bg-[#00ff88]/5"
          >
            <div 
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse"
            ></div>
            <span className="font-mono text-[10px] text-[#00ff88] tracking-widest leading-none">
              CORE ONLINE
            </span>
          </div>

          {/* Auth Section */}
          <div className="hidden sm:flex items-center gap-4 border-l border-[#2a2a2a] pl-6 ml-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-[#ff8c00] tracking-widest uppercase">Connected</span>
                  <span className="text-[9px] font-mono text-[#555] lowercase">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-[#555] hover:text-red-500 transition-colors"
                  title="Sever Connection (Sign Out)"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-[#ff8c00]/10 border border-[#ff8c00]/30 rounded text-[#ff8c00] font-mono text-[10px] tracking-widest hover:bg-[#ff8c00] hover:text-black transition-all"
              >
                <LogIn size={14} />
                INITIALIZE
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
