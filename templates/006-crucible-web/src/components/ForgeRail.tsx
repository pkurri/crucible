'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Database,
  Zap,
  Bot,
  Monitor,
  Activity,
  Radio,
  Hammer,
  Map,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'THE ARMORY', icon: Shield, sublabel: 'Templates' },
  { href: '/skills', label: 'CORE SAMPLES', icon: Database, sublabel: 'Skills' },
  { href: '/flux', label: 'FLUX', icon: Zap, sublabel: 'Real-Time' },
  { href: '/agents', label: 'SWARM AGENTS', icon: Bot, sublabel: 'Agents' },
  { href: '/stage', label: 'THE STAGE', icon: Monitor, sublabel: 'Stage' },
  { href: '/monitoring', label: 'TELEMETRY', icon: Activity, sublabel: 'Monitoring' },
  { href: '/intel', label: 'INTEL', icon: Radio, sublabel: 'Transmissions' },
  { href: '/foundry', label: 'THE FOUNDRY', icon: Hammer, sublabel: 'About' },
  { href: '/blueprint', label: 'THE BLUEPRINT', icon: Map, sublabel: 'How-To Guide' },
];

export function ForgeRail({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-50 flex flex-col
        bg-[#050505] border-r border-[#ff8c00]/15
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[64px]' : 'w-[220px]'}
      `}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-[#1a1a1a] shrink-0 overflow-hidden`}>
        {/* Triangle logo */}
        <div className="shrink-0 w-0 h-0 border-l-[9px] border-l-transparent border-b-[15px] border-b-[#ff8c00] border-r-[9px] border-r-transparent animate-[pulse-amber_2s_infinite_ease-in-out]" />
        {!collapsed && (
          <span className="font-black tracking-[0.2em] text-[#e0e0e0] text-sm whitespace-nowrap">
            CRUCIBLE
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-0.5 px-2">
        {navItems.map(({ href, label, icon: Icon, sublabel }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`
                group flex items-center gap-3 px-2 py-2.5 rounded-sm
                font-mono text-[11px] tracking-widest transition-all duration-150
                ${active
                  ? 'bg-[#ff8c00]/10 text-[#ff8c00]'
                  : 'text-[#555] hover:bg-[#111] hover:text-[#e0e0e0]'
                }
              `}
            >
              {/* Icon */}
              <div className={`shrink-0 relative ${active ? 'text-[#ff8c00]' : 'text-[#444] group-hover:text-[#ff8c00]'} transition-colors duration-150`}>
                <Icon size={18} strokeWidth={1.5} />
                {active && (
                  <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#ff8c00] shadow-[0_0_6px_#ff8c00]" />
                )}
              </div>

              {/* Label */}
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate">{label}</span>
                  <span className={`text-[9px] tracking-widest truncate ${active ? 'text-[#ff8c00]/60' : 'text-[#333] group-hover:text-[#444]'}`}>
                    {sublabel}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status dot + collapse toggle */}
      <div className="border-t border-[#1a1a1a] shrink-0">
        {/* CORE ONLINE status */}
        <div className={`flex items-center gap-2 px-4 py-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse shrink-0" />
          {!collapsed && (
            <span className="font-mono text-[9px] text-[#00ff88] tracking-widest truncate">
              CORE ONLINE
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={`w-full flex items-center px-4 py-3 border-t border-[#1a1a1a] text-[#333] hover:text-[#ff8c00] hover:bg-[#0d0800] transition-colors duration-150 ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <span className="font-mono text-[9px] tracking-widest">COLLAPSE</span>
          )}
          {collapsed ? (
            <ChevronRight size={14} strokeWidth={1.5} />
          ) : (
            <ChevronLeft size={14} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </aside>
  );
}
