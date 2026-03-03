'use client';

import { useState } from 'react';
import { ForgeRail } from './ForgeRail';
import { Menu } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <ForgeRail 
        collapsed={collapsed} 
        onToggle={() => setCollapsed((c) => !c)} 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#050505] border-b border-[#ff8c00]/20 z-30 flex items-center px-4">
        <button 
          onClick={() => setMobileOpen(true)}
          aria-label="Open mobile menu"
          className="p-2 -ml-2 text-[#e0e0e0] hover:text-[#ff8c00] transition-colors"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
        <div className="ml-2 flex items-center gap-3">
          <div 
            aria-hidden="true"
            className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[10px] border-b-[#ff8c00] border-r-[6px] border-r-transparent animate-[pulse-amber_2s_infinite_ease-in-out]" 
          />
          <span className="font-black tracking-[0.2em] text-[#e0e0e0] text-sm leading-none mt-1">
            CRUCIBLE
          </span>
        </div>
      </div>

      <div className={`min-h-screen transition-all duration-300 pt-14 md:pt-0 ${collapsed ? 'md:pl-[64px]' : 'md:pl-[220px]'}`}>
        {children}
      </div>
    </>
  );
}
