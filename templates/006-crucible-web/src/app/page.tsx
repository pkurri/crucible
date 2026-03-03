"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Bot, Database, Zap, Plus, ArrowRight, Activity, Terminal, CheckCircle2, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function Home() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ success: boolean; message: string } | null>(null);
  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase
        .from('forge_templates')
        .select('*')
        .order('template_id', { ascending: true });
        
      if (!error && data) {
        setTemplates(data);
      }
      setIsLoading(false);
    }
    fetchTemplates();
  }, []);

  const totalPages = Math.ceil(templates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTemplates = templates.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <main className="min-h-screen pt-12 pb-24">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="mb-12 border-b border-[#2a2a2a] pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-[#e0e0e0] mb-4 tracking-tight">
              THE ARMORY
            </h1>
            <p className="font-mono text-[#ff8c00] text-sm tracking-widest uppercase flex items-center gap-3">
              <span className="w-2 h-2 bg-[#ff8c00] animate-pulse rounded-full"></span>
              {templates.length} Autonomous Architecture Templates
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#111] hover:bg-[#222] disabled:opacity-50 text-white font-mono text-sm border border-[#333] transition-colors"
            >
              &lt; PREV
            </button>
            <div className="px-4 py-2 font-mono text-[#888] text-sm border border-[#2a2a2a] bg-[#050505]">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#111] hover:bg-[#222] disabled:opacity-50 text-white font-mono text-sm border border-[#333] transition-colors"
            >
              NEXT &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleTemplates.map((tpl) => (
            <TemplateCard
              key={tpl.id || tpl.template_id}
              template={tpl}
              onClick={() => setSelectedTemplate(tpl)}
            />
          ))}
        </div>
      </div>

      {/* Slide-out Detail Panel */}
      <AnimatePresence>
        {selectedTemplate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTemplate(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-[#0a0a0c] border-l border-[#222] z-50 overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <button 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setDeployResult(null);
                  }}
                  className="absolute top-6 right-6 text-[#666] hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {deployResult && (
                  <div className={`mb-6 p-4 rounded-lg font-mono text-xs border ${deployResult.success ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : 'bg-[#ff3333]/10 border-[#ff3333]/30 text-[#ff3333]'}`}>
                    {deployResult.success ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {deployResult.message}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4" /> {deployResult.message}
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[#ff8c00] text-sm tracking-wider px-2 py-1 bg-[#ff8c00]/10 border border-[#ff8c00]/20 rounded">
                      TPL-{selectedTemplate.template_id}
                    </span>
                    <span className="text-xs font-mono tracking-widest px-2 py-1 bg-[#222] text-[#888] rounded">
                      {selectedTemplate.category.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 leading-tight">{selectedTemplate.name}</h2>
                  <p className="text-[#a0a0a0] font-mono text-sm leading-relaxed">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#111] border border-[#222] p-4 rounded-xl">
                    <span className="text-[#666] font-mono text-[10px] uppercase block mb-1">Complexity</span>
                    <span className="text-white font-mono font-bold text-sm tracking-wide">{selectedTemplate.complexity}</span>
                  </div>
                  <div className="bg-[#111] border border-[#222] p-4 rounded-xl">
                    <span className="text-[#666] font-mono text-[10px] uppercase block mb-1">TimeToDeploy</span>
                    <span className="text-white font-mono font-bold text-sm tracking-wide">{selectedTemplate.estimated_setup}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="flex items-center gap-2 font-mono text-[11px] text-[#ff8c00] tracking-[0.2em] uppercase mb-4">
                    <Bot className="w-4 h-4" /> Included Agents
                  </h3>
                  <div className="space-y-3">
                    {selectedTemplate.included_agents?.map((agent: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[#111] border border-[#222] rounded-lg">
                        <div className="flex items-center gap-3">
                          <Terminal className="w-4 h-4 text-[#555]" />
                          <span className="text-sm font-bold text-white">{agent.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded">
                          {agent.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="flex items-center gap-2 font-mono text-[11px] text-[#ff8c00] tracking-[0.2em] uppercase mb-4">
                    <Zap className="w-4 h-4" /> Core Capabilities
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTemplate.capabilities?.map((cap: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#888] font-mono">
                        <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 border-t border-[#222]">
                  <button 
                    onClick={async () => {
                      setIsDeploying(true);
                      setDeployResult(null);
                      try {
                        const res = await fetch('/api/forge/blueprints', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            templateId: selectedTemplate.template_id,
                            name: selectedTemplate.name,
                            spec: selectedTemplate,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setDeployResult({ success: true, message: 'Blueprint queued. Check Foundry Core.' });
                        } else {
                          setDeployResult({ success: false, message: data.error || 'Deployment failed.' });
                        }
                      } catch (e: any) {
                        setDeployResult({ success: false, message: 'Failed to connect to Forge API.' });
                      } finally {
                        setIsDeploying(false);
                      }
                    }}
                    disabled={isDeploying || deployResult?.success}
                    className="w-full py-4 bg-gradient-to-r from-[#ff8c00] to-[#ff6600] hover:from-[#ff9d2e] hover:to-[#ff7b2e] text-black font-mono font-bold text-sm tracking-wide flex items-center justify-center gap-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,140,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeploying ? (
                      <>INITIATING FORGE SEQUENCE <Activity className="w-4 h-4 animate-spin" /></>
                    ) : deployResult?.success ? (
                      <>BLUEPRINT DEPLOYED <CheckCircle2 className="w-4 h-4" /></>
                    ) : (
                      <>DEPLOY TO FORGE <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <p className="text-center text-[#555] font-mono text-[10px] mt-4">
                    Initiates autonomous provisioning sequence in Foundry Core.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function TemplateCard({
  template,
  onClick,
}: {
  template: any;
  onClick: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="group bg-[#0a0a0c] border border-[#1a1a1a] hover:border-[#ff8c00]/30 p-6 flex flex-col h-full cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(255,140,0,0.05)] rounded-xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff8c00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[#ff8c00] font-bold text-sm tracking-wider">
            TPL-{template.template_id}
          </span>
          {template.agent_id && (
            <span className="font-mono text-[9px] text-[#555] flex items-center gap-1 uppercase tracking-tighter">
              <Bot className="w-2.5 h-2.5" /> Forged by {template.agent_id}
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono top-right tracking-widest px-2 py-1 bg-[#111] text-[#666] border border-[#222] rounded group-hover:bg-[#ff8c00]/10 group-hover:text-[#ff8c00] group-hover:border-[#ff8c00]/20 transition-colors">
          {template.category.toUpperCase()}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-3 text-white leading-tight group-hover:text-[#ff8c00] transition-colors relative z-10">
        {template.name}
      </h3>
      <p className="text-[#555] font-mono text-xs leading-relaxed mb-6 flex-grow relative z-10 line-clamp-3">
        {template.description}
      </p>
      
      <div className="mt-auto pt-4 border-t border-[#1a1a1a] group-hover:border-[#ff8c00]/20 flex justify-between items-center transition-colors relative z-10">
        <div className="flex gap-1.5">
          <div className="w-1.5 h-4 bg-[#333] group-hover:bg-[#ff8c00] transition-colors duration-300 delay-0"></div>
          <div className="w-1.5 h-4 bg-[#333] group-hover:bg-[#ff8c00] transition-colors duration-300 delay-75"></div>
          <div className="w-1.5 h-4 bg-[#333] group-hover:bg-[#ff8c00] transition-colors duration-300 delay-150"></div>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#444] group-hover:text-[#ff8c00] transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
          View Definition <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </span>
      </div>
    </div>
  );
}
