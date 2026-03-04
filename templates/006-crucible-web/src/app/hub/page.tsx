'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Layers, 
  Cpu, 
  Zap, 
  Download, 
  Share2, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRight,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Box,
  BrainCircuit,
  Database,
  Terminal,
  Fingerprint,
  Lock,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HubTemplate {
  id: string;
  template_id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  tier: string;
  complexity: string;
  estimated_setup: string;
  included_agents: string[];
  capabilities: string[];
}

interface HubSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  capabilities: string[];
}

const ICON_MAP: Record<string, any> = {
  BrainCircuit,
  Shield,
  Database,
  Cloud: Globe,
  Zap,
  Fingerprint,
  Lock,
  Terminal,
  Box
};

export default function ForgeHub() {
  const [templates, setTemplates] = useState<HubTemplate[]>([]);
  const [skills, setSkills] = useState<HubSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'skills'>('templates');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeToast, setActiveToast] = useState<{ id: string; name: string } | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  const handleImport = async (tpl: HubTemplate) => {
    setImportingId(tpl.id);
    // Simulate planetary sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    setImportingId(null);
    setActiveToast({ id: tpl.id, name: tpl.name });
    
    // Auto-hide toast
    setTimeout(() => setActiveToast(null), 4000);
  };

  useEffect(() => {
    async function fetchData() {
      const [{ data: templatesData }, { data: skillsData }] = await Promise.all([
        supabase.from('forge_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('forge_skills').select('*').order('created_at', { ascending: false })
      ]);

      setTemplates(templatesData || []);
      setSkills(skillsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen pb-24 bg-[#050505] text-[#e0e0e0]">
      {/* Neural Header Background */}
      <div className="absolute inset-x-0 top-0 h-[500px] overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,140,0,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-20 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-[#ff8c00] animate-spin-slow" />
            <span className="font-mono text-[#ff8c00] tracking-[0.5em] text-[10px] uppercase">Cross-Forge Registry</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-[#222] uppercase tracking-tighter leading-[0.85] mb-6">
            FORGE<br />HUB
          </h1>
          <p className="text-[#999] font-mono text-xs md:text-sm max-w-xl leading-relaxed uppercase tracking-wider">
            Standardized registry for planetary AI intelligence. Browse architectural blueprints 
            and MCP skills shared by the global automation fleet.
          </p>
        </motion.div>

        {/* Global Stats HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Intelligence Nodes', value: '1,248', icon: Globe },
            { label: 'Shared Blueprints', value: templates.length, icon: Layers },
            { label: 'Skill Definitions', value: skills.length, icon: Cpu },
            { label: 'Active Syncs', value: 'Active', icon: Zap, status: 'stable' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="brick p-5 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/50 backdrop-blur"
            >
              <stat.icon className="w-4 h-4 text-[#ff8c00] mb-3" />
              <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-black mt-1 text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-[#111] pb-8">
          <div className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#1a1a1a]">
            {(['templates', 'skills'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-mono text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-[#ff8c00] text-black font-bold shadow-[0_0_20px_rgba(255,140,0,0.3)]' 
                    : 'text-[#888] hover:text-[#bbb]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder={`SEARCH FORGE ${activeTab === 'templates' ? 'BLUEPRINTS' : 'SKILLS'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080808] border border-[#1a1a1a] rounded-xl py-3 pl-12 pr-4 font-mono text-[10px] uppercase tracking-widest focus:border-[#ff8c00]/50 focus:outline-none transition-all placeholder:text-[#444]"
            />
          </div>
        </div>

        {/* Grid Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'templates' ? (
            <motion.div
              key="templates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTemplates.map((tpl, i) => {
                const IconComp = ICON_MAP[tpl.icon] || Box;
                return (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onMouseEnter={() => setHoveredId(tpl.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="brick relative group rounded-2xl border border-[#111] bg-[#080808] p-6 hover:border-[#ff8c00]/30 transition-all duration-500 overflow-hidden"
                  >
                    {/* Background Detail */}
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#ff8c00]/5 rounded-full blur-3xl group-hover:bg-[#ff8c00]/10 transition-all" />
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 bg-gradient-to-br from-[#111] to-black rounded-xl border border-[#222]">
                        <IconComp className="w-6 h-6 text-[#ff8c00]" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[8px] text-[#888] uppercase tracking-widest mb-1">{tpl.tier}</span>
                        <div className={`w-3 h-3 rounded-full ${tpl.complexity === 'High' ? 'bg-[#ff3333]' : tpl.complexity === 'Medium' ? 'bg-[#ff8c00]' : 'bg-[#00ff88]'} blur-[4px]`} />
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 group-hover:text-[#ff8c00] transition-colors">
                      {tpl.name}
                    </h3>
                    <p className="text-[#999] text-xs leading-relaxed mb-6 line-clamp-2 uppercase tracking-wide">
                      {tpl.description}
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#111] pb-2">
                        <span className="text-[#888] uppercase">Complexity</span>
                        <span className="text-white">{tpl.complexity}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#111] pb-2">
                        <span className="text-[#888] uppercase">Agents</span>
                        <span className="text-white">{tpl.included_agents?.length || 0} Nodes</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleImport(tpl)}
                      disabled={importingId === tpl.id}
                      className="w-full py-3 bg-[#111] hover:bg-[#ff8c00] text-[#ff8c00] hover:text-black font-mono text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg transition-all border border-[#222] hover:border-[#ff8c00] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    >
                      {importingId === tpl.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 group-hover/btn:scale-125 transition-transform" />
                      )}
                      {importingId === tpl.id ? 'SYNCING...' : 'Import Blueprint'}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="skills"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#111] border border-[#111] rounded-2xl overflow-hidden shadow-2xl"
            >
              {filteredSkills.map((skill, i) => (
                <div 
                  key={skill.id}
                  className="bg-[#080808] p-8 hover:bg-[#0c0c0c] transition-colors group relative"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="font-mono text-[9px] text-[#ff8c00] uppercase tracking-[0.3em] mb-2">{skill.category}</div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-[#ff8c00] transition-colors">
                        {skill.name}
                      </h3>
                    </div>
                    <button className="p-2 bg-[#111] rounded-lg border border-[#222] text-[#888] hover:text-[#ff8c00] transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[#999] text-sm leading-relaxed mb-8 max-w-md">
                    {skill.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skill.capabilities?.map((cap, ci) => (
                      <span key={ci} className="px-3 py-1 bg-[#111] border border-[#222] text-[#888] font-mono text-[9px] uppercase tracking-widest rounded-full">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-[#ff8c00]/20 border-t-[#ff8c00] rounded-full animate-spin mb-4" />
            <div className="font-mono text-[10px] text-[#444] uppercase tracking-widest">Synchronizing Hub...</div>
          </div>
        )}

        {!loading && filteredTemplates.length === 0 && activeTab === 'templates' && (
          <div className="text-center py-32 border-2 border-dashed border-[#111] rounded-3xl">
            <Box className="w-12 h-12 text-[#1a1a1a] mx-auto mb-4" />
            <div className="font-mono text-xs text-[#444] uppercase tracking-widest">No matching blueprints found in the registry</div>
          </div>
        )}
        
        {/* Notification Toast */}
        <AnimatePresence>
          {activeToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-10 right-10 z-[100] brick p-6 rounded-2xl border border-[#ff8c00]/40 bg-[#0d0800] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 min-w-[320px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#ff8c00]/20 flex items-center justify-center border border-[#ff8c00]/30 shadow-[0_0_15px_rgba(255,140,0,0.2)]">
                <CheckCircle className="w-5 h-5 text-[#ff8c00]" />
              </div>
              <div>
                <div className="font-mono text-[9px] text-[#ff8c00] tracking-[0.3em] uppercase mb-1">PLANETARY SYNC COMPLETE</div>
                <div className="text-white font-bold text-sm tracking-tight">{activeToast.name.toUpperCase()} IMPORTED</div>
              </div>
              <button 
                onClick={() => setActiveToast(null)}
                className="ml-auto text-[#444] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
