'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="border-b-2 border-[#ff8c00]/20 bg-[#050505]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[20px] border-b-[#ff8c00] border-r-[12px] border-r-transparent animate-pulse-molten"></div>
          <Link href="/" className="text-2xl font-black tracking-widest text-[#e0e0e0]">
            CRUCIBLE
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-12 font-mono text-xs tracking-[0.2em]">
          <Link 
            href="/" 
            className={`hover:text-[#ff8c00] transition-colors ${pathname === '/' ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}
          >
            THE ARMORY
          </Link>
          <Link 
            href="/skills" 
            className={`hover:text-[#ff8c00] transition-colors ${pathname === '/skills' ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}
          >
            CORE SAMPLES
          </Link>
          <Link 
            href="/flux" 
            className={`hover:text-[#ff8c00] transition-colors ${pathname === '/flux' ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}
          >
            REAL-TIME FLUX
          </Link>
          <Link 
            href="/agents" 
            className={`hover:text-[#ff8c00] transition-colors ${pathname === '/agents' ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}
          >
            SWARM AGENTS
          </Link>
          <Link 
            href="/stage" 
            className={`hover:text-[#ff8c00] transition-colors ${pathname === '/stage' ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}
          >
            THE STAGE
          </Link>
          <Link 
            href="/monitoring" 
            className={`hover:text-[#ff8c00] transition-colors ${pathname === '/monitoring' ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}
          >
            TELEMETRY
          </Link>
          <Link 
            href="/intel" 
            className={`hover:text-[#ff8c00] transition-colors ${pathname === '/intel' ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}
          >
            INTEL
          </Link>
          <Link 
            href="/foundry" 
            className={`hover:text-[#ff8c00] transition-colors ${pathname === '/foundry' ? 'text-[#ff8c00]' : 'text-[#e0e0e0]'}`}
          >
            THE FOUNDRY
          </Link>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3 px-4 py-1.5 border border-[#00ff88]/30 rounded-full bg-[#00ff88]/5">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse"></div>
          <span className="font-mono text-[10px] text-[#00ff88] tracking-widest">
            CORE ONLINE
          </span>
        </div>

      </div>
    </nav>
  );
}
