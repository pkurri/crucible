'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
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
  FileText,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Flame,
  Globe,
  Gamepad2,
  Lock,
  PieChart,
  ChevronDown,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NavItem = {
  href: string;
  label: string;
  icon: any;
  sublabel: string;
  restricted?: boolean;
  priority?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: 'core',
    label: 'CORE FORGE',
    items: [
      { href: '/', label: 'THE ARMORY', icon: Shield, sublabel: 'Templates' },
      { href: '/hub', label: 'FORGE HUB', icon: Globe, sublabel: 'Registry' },
      { href: '/foundry-core', label: 'FOUNDRY CORE', icon: Flame, sublabel: 'Nerve Center' },
    ]
  },
  {
    id: 'content',
    label: 'CONTENT ENGINE',
    items: [
      { href: '/article-core', label: 'ARTICLE CORE', icon: FileText, sublabel: 'Content Engine' },
      { href: '/infographics', label: 'DATA INTEL', icon: PieChart, sublabel: 'Infographics' },
      { href: '/intel', label: 'INTEL', icon: Radio, sublabel: 'Transmissions' },
    ]
  },
  {
    id: 'command',
    label: 'COMMAND & CONTROL',
    items: [
      { href: '/dashboard', label: 'COMMAND CENTER', icon: LayoutDashboard, sublabel: 'Agents + Articles' },
      { href: '/network', label: 'GROWTH ENGINE', icon: Network, sublabel: 'Moltbook Operations' },
      { href: '/agents', label: 'SWARM AGENTS', icon: Bot, sublabel: 'Agents' },
      { href: '/monitoring', label: 'TELEMETRY', icon: Activity, sublabel: 'Monitoring' },
    ]
  },
  {
    id: 'lab',
    label: 'LAB & RESOURCES',
    items: [
      { href: '/skills', label: 'CORE SAMPLES', icon: Database, sublabel: 'Skills' },
      { href: '/flux', label: 'FLUX', icon: Zap, sublabel: 'Real-Time' },
      { href: '/stage', label: 'THE STAGE', icon: Monitor, sublabel: 'Stage' },
      { href: '/blueprint', label: 'THE BLUEPRINT', icon: Map, sublabel: 'How-To Guide' },
    ]
  },
  {
    id: 'misc',
    label: 'MISC',
    items: [
      { href: '/foundry', label: 'THE FOUNDRY', icon: Hammer, sublabel: 'About' },
      { href: '/game-studio', label: 'NEON ARCADE', icon: Gamepad2, sublabel: 'AI Game Studio', restricted: true },
    ]
  }
];

export function ForgeRail({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['core', 'content', 'command', 'lab', 'misc']);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const { href, label, icon: Icon, sublabel } = item;
    const active = pathname === href;
    const restricted = !!item.restricted || (!user && href !== '/' && href !== '/login');
    
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={() => onMobileClose()}
          title={collapsed ? label : undefined}
          aria-current={active ? 'page' : undefined}
          className={`
            group flex items-center gap-3 px-2 py-2 rounded-sm
            font-mono text-[10px] tracking-widest transition-all duration-150
            ${active
              ? 'bg-[#ff8c00]/10 text-[#ff8c00]'
              : item.priority
                ? 'bg-[#ff8c00]/5 text-[#ff8c00] border border-[#ff8c00]/20 hover:bg-[#ff8c00]/15'
                : restricted
                  ? 'text-[#444] hover:bg-[#050505] cursor-not-allowed'
                  : 'text-[#999] hover:bg-[#111] hover:text-[#fff]'
            }
          `}
        >
          {/* Icon */}
          <div className={`shrink-0 relative ${
            active ? 'text-[#ff8c00]' : 
            restricted ? 'text-[#222]' : 
            'text-[#666] group-hover:text-[#ff8c00]'
          } transition-colors duration-150`}>
            <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
            {active && (
              <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-[#ff8c00] shadow-[0_0_6px_#ff8c00]" />
            )}
          </div>

          {/* Label */}
          <div className={`flex flex-col flex-1 overflow-hidden ${collapsed ? 'md:hidden' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="break-all whitespace-normal leading-tight">{label}</span>
              {restricted && (
                <Lock size={10} className="text-[#333] group-hover:text-[#ff8c00]/40" />
              )}
            </div>
            <span className={`text-[8px] tracking-widest truncate ${
              active ? 'text-[#ff8c00]/60' : 
              restricted ? 'text-[#222]' : 
              'text-[#888] group-hover:text-[#aaa]'
            }`}>
              {restricted ? 'RESTRICTED' : sublabel}
            </span>
          </div>
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          role="presentation"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        aria-label="Sidebar Navigation"
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-[#050505] border-r border-[#ff8c00]/15
          transition-all duration-300 ease-in-out
          w-[260px] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 ${collapsed ? 'md:w-[64px]' : 'md:w-[220px]'}
        `}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-[#1a1a1a] shrink-0 overflow-hidden`}>
          <div 
            aria-hidden="true"
            className="shrink-0 w-0 h-0 border-l-[9px] border-l-transparent border-b-[15px] border-b-[#ff8c00] border-r-[9px] border-r-transparent animate-[pulse-amber_2s_infinite_ease-in-out]" 
          />
          <span className={`font-black tracking-[0.2em] text-[#e0e0e0] text-sm whitespace-nowrap ${collapsed ? 'md:hidden' : ''}`}>
            CRUCIBLE
          </span>
        </div>

        {/* Nav Items */}
        <nav 
          aria-label="Sidebar Menu"
          className="flex-1 py-4 overflow-y-auto overflow-x-hidden no-scrollbar px-2"
        >
          {!user ? (
            <ul className="space-y-1">
              {renderNavItem({ href: '/', label: 'THE ARMORY', icon: Shield, sublabel: 'Templates' })}
              {renderNavItem({ href: '/login', label: 'FORGE IDENTITY', icon: Shield, sublabel: 'Sign In / Up', priority: true })}
            </ul>
          ) : (
            <div className="space-y-6">
              {navGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`
                      w-full flex items-center justify-between px-2 py-1
                      text-[9px] font-bold tracking-[0.2em] text-[#444] hover:text-[#ff8c00]
                      transition-colors uppercase mb-1
                      ${collapsed ? 'md:justify-center' : ''}
                    `}
                  >
                    {!collapsed && <span>{group.label}</span>}
                    {!collapsed && (
                      <ChevronDown 
                        size={10} 
                        className={`transition-transform duration-200 ${expandedGroups.includes(group.id) ? 'rotate-180' : ''}`}
                      />
                    )}
                    {collapsed && <div className="w-4 h-0.5 bg-[#222]" />}
                  </button>

                  {/* Group Items */}
                  <AnimatePresence initial={false}>
                    {(expandedGroups.includes(group.id) || collapsed) && (
                      <motion.ul
                        initial={collapsed ? undefined : { height: 0, opacity: 0 }}
                        animate={collapsed ? undefined : { height: 'auto', opacity: 1 }}
                        exit={collapsed ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="space-y-0.5 overflow-hidden"
                      >
                        {group.items.map(item => renderNavItem(item))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Status dot + collapse toggle */}
        <div className="border-t border-[#1a1a1a] shrink-0">
          <div 
            aria-label="Core system status: Online"
            className={`flex items-center gap-2 px-4 py-3 ${collapsed ? 'md:justify-center' : ''}`}
          >
            <div 
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse shrink-0" 
            />
            <span className={`font-mono text-[9px] text-[#00ff88] tracking-widest truncate ${collapsed ? 'md:hidden' : ''}`}>
              CORE ONLINE
            </span>
          </div>

          <button
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden md:flex w-full items-center px-4 py-3 border-t border-[#1a1a1a] text-[#888] hover:text-[#ff8c00] hover:bg-[#0d0800] transition-colors duration-150 ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            <span className={`font-mono text-[9px] tracking-widest ${collapsed ? 'md:hidden' : ''}`}>
              {collapsed ? "" : "COLLAPSE"}
            </span>
            {collapsed ? (
              <ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <ChevronLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
