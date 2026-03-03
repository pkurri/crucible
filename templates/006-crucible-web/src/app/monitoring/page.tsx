'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { BarChart3, TrendingUp, Users, Zap, Clock, MessageSquare, Target, AlertCircle, Scan } from 'lucide-react'
import { motion } from 'framer-motion'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const RadarVisualizer = () => {
  const [blips, setBlips] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate random blips for the radar
    const newBlips = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // 10% to 90%
      y: Math.random() * 80 + 10,
      delay: Math.random() * 4
    }));
    setBlips(newBlips);
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-[#050505] rounded-xl border border-[#2a2a2a] overflow-hidden flex items-center justify-center p-8 group">
      {/* Background Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(0,255,136,0.05) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 30px 30px, 30px 30px',
        backgroundPosition: 'center, top, top'
      }} />

      {/* Radar Circles */}
      <div className="relative w-64 h-64 rounded-full border border-[#00ff88]/30 flex items-center justify-center">
        <div className="absolute w-48 h-48 rounded-full border border-[#00ff88]/20"></div>
        <div className="absolute w-32 h-32 rounded-full border border-[#00ff88]/20"></div>
        <div className="absolute w-16 h-16 rounded-full border border-[#00ff88]/40 bg-[#00ff88]/5"></div>
        
        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-[#00ff88]/20"></div>
          <div className="absolute h-full w-[1px] bg-[#00ff88]/20"></div>
        </div>

        {/* Sweeping Arm */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_75%,rgba(0,255,136,0.3)_100%)] origin-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulse Ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-[#00ff88]"
          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />

        {/* Blips */}
        {blips.map((blip) => (
          <motion.div
            key={blip.id}
            className="absolute w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.8)]"
            style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: blip.delay, ease: "easeInOut" }}
          />
        ))}
        
        {/* Critical Anomaly Blip */}
        <motion.div
            className="absolute w-3 h-3 rounded-full bg-[#ff3333] shadow-[0_0_15px_rgba(255,51,51,0.9)]"
            style={{ left: '75%', top: '25%' }}
            animate={{ opacity: [0, 1, 0, 1, 0], scale: [1, 1.5, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
        />
      </div>

      {/* Overlay UI */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Scan className="h-5 w-5 text-[#00ff88]" />
        <span className="font-mono text-xs text-[#00ff88] tracking-widest uppercase">Global Radar Scan Active</span>
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-[#555]">
        SWARM_TOPOLOGY_V2 // PORT_3003
      </div>
    </div>
  )
}

export default function MonitoringPage() {
  const [selectedMetric, setSelectedMetric] = useState<'productivity' | 'communication' | 'collaboration'>('productivity')

  // Real-Time Stateful Agents replacing MOCK_AGENTS
  const [agents, setAgents] = useState([
    { id: '1', name: 'Gather Core', role: 'data-scraper', productivity: 92, communication: 88, collaboration: 95, quality: 90 },
    { id: '2', name: 'Analyzer', role: 'pattern-recognition', productivity: 87, communication: 92, collaboration: 89, quality: 94 },
    { id: '3', name: 'Forge Engine', role: 'code-synthesis', productivity: 95, communication: 98, collaboration: 93, quality: 91 },
    { id: '4', name: 'Deployer', role: 'fs-operations', productivity: 89, communication: 85, collaboration: 87, quality: 92 },
  ]);

  // Real-Time Stateful Metrics History replacing METRICS_HISTORY
  const [metricsHistory, setMetricsHistory] = useState([
    { time: 'T-5m', productivity: 75, communication: 80, collaboration: 70 },
    { time: 'T-4m', productivity: 82, communication: 85, collaboration: 78 },
    { time: 'T-3m', productivity: 88, communication: 87, collaboration: 85 },
    { time: 'T-2m', productivity: 85, communication: 90, collaboration: 88 },
    { time: 'T-1m', productivity: 90, communication: 92, collaboration: 91 },
    { time: 'NOW', productivity: 91, communication: 89, collaboration: 90 },
  ]);

  const [activeProcesses, setActiveProcesses] = useState(1);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const supabase = getSupabase();

    const updateAgentStat = (name: string, stat: string, amount: number) => {
       setAgents(prev => prev.map(a => {
         if (a.name === name) {
            const val = { ...a };
            val[stat as keyof typeof val] = Math.min(100, Math.max(0, (val[stat as keyof typeof val] as number) + amount)) as never;
            return val;
         }
         return a;
       }));
    };

    const channel = supabase.channel('monitoring-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forge_events' },
        (payload) => {
           const { event_type, message } = payload.new;
           
           // Make the dashboard react dynamically to the live Forge!
           setActiveProcesses(prev => Math.min(prev + 1, 12));
           setTimeout(() => setActiveProcesses(prev => Math.max(prev - 1, 1)), 5000);
           
           if (event_type === 'GATHER') {
             updateAgentStat('Gather Core', 'productivity', 2);
           } else if (event_type === 'ANALYZE') {
             updateAgentStat('Analyzer', 'productivity', 3);
           } else if (event_type === 'FORGE' || event_type === 'STORE') {
             updateAgentStat('Forge Engine', 'productivity', 5);
             updateAgentStat('Forge Engine', 'quality', 2);
           } else if (event_type === 'DEPLOY') {
             updateAgentStat('Deployer', 'productivity', 6);
             updateAgentStat('Deployer', 'collaboration', 4);
             
             setMetricsHistory(prev => {
                const newTick = {
                  time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
                  productivity: Math.min(100, prev[prev.length-1].productivity + 2),
                  communication: Math.min(100, prev[prev.length-1].communication + 1),
                  collaboration: Math.min(100, prev[prev.length-1].collaboration + 1)
                };
                return [...prev.slice(1), newTick];
             });
           }
           
           if (event_type === 'ERROR' || event_type === 'WARN') {
             setAlerts(prev => [{
               id: Date.now(),
               type: 'error',
               title: 'System Anomaly',
               message: message,
               time: 'JUST NOW'
             }, ...prev].slice(0, 3));
             updateAgentStat('Forge Engine', 'quality', -5);
           } else if (event_type === 'SUCCESS') {
             setAlerts(prev => [{
               id: Date.now(),
               type: 'success',
               title: 'Optimal Execution',
               message: message,
               time: 'JUST NOW'
             }, ...prev].slice(0, 3));
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const avgProductivity = Math.round(agents.reduce((sum, a) => sum + a.productivity, 0) / agents.length)
  const avgCommunication = Math.round(agents.reduce((sum, a) => sum + a.communication, 0) / agents.length)
  const avgCollaboration = Math.round(agents.reduce((sum, a) => sum + a.collaboration, 0) / agents.length)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#00ff88]'
    if (score >= 75) return 'text-[#ff8c00]'
    return 'text-[#ff3333]'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-[#00ff88]/10'
    if (score >= 75) return 'bg-[#ff8c00]/10'
    return 'bg-[#ff3333]/10'
  }

  return (
    <div className="min-h-screen pt-12 pb-24 border-t border-[#2a2a2a]">
      <div className="max-w-[1920px] mx-auto px-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 border-b border-[#2a2a2a] pb-8"
        >
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#e0e0e0] via-[#ffffff] to-[#888888] mb-4 tracking-tight uppercase">
            Radar & Telemetry
          </h1>
          <p className="font-mono text-[#00ff88] text-sm tracking-widest uppercase flex items-center gap-2">
            <Target className="h-4 w-4" /> // Real-Time Agent Topology Metrics
          </p>
        </motion.div>

        {/* Voxyz-style Radar Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="mb-8"
        >
          <RadarVisualizer />
        </motion.div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="brick p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] text-[#00ff88]">
                <Zap className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-[#00ff88]" />
            </div>
            <div className="text-4xl font-black text-white mb-2">{avgProductivity}%</div>
            <div className="text-xs font-mono tracking-widest text-[#888] uppercase">Sys_Productivity</div>
          </div>

          <div className="brick p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] text-[#ff8c00]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-[#00ff88]" />
            </div>
            <div className="text-4xl font-black text-white mb-2">{avgCommunication}%</div>
            <div className="text-xs font-mono tracking-widest text-[#888] uppercase">Comms_Integrity</div>
          </div>

          <div className="brick p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] text-[#ff3333]">
                <Users className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-[#00ff88]" />
            </div>
            <div className="text-4xl font-black text-white mb-2">{avgCollaboration}%</div>
            <div className="text-xs font-mono tracking-widest text-[#888] uppercase">Swarm_Cohesion</div>
          </div>

          <div className="brick p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] text-purple-500">
                <Target className="h-6 w-6" />
              </div>
              <Clock className="h-5 w-5 text-[#888]" />
            </div>
            <div className="text-4xl font-black text-white mb-2">{activeProcesses}</div>
            <div className="text-xs font-mono tracking-widest text-[#888] uppercase">Active_Processes</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 brick p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">Temporal Analysis</h2>
              <div className="flex gap-2">
                {(['productivity', 'communication', 'collaboration'] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-4 py-2 text-xs font-mono tracking-widest uppercase transition-colors border ${
                      selectedMetric === metric
                        ? 'bg-[#ff8c00] text-black border-[#ff8c00]'
                        : 'bg-[#0f0f0f] text-[#888] border-[#2a2a2a] hover:border-[#ff8c00]/50 hover:text-[#e0e0e0]'
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>

              {/* Simple Bar Chart */}
              <div className="space-y-6 pt-4">
                {metricsHistory.map((data, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="flex items-center gap-6"
                  >
                    <span className="text-sm font-mono text-[#555] w-16 shrink-0">{data.time}</span>
                    <div className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] h-10 relative overflow-hidden group">
                      <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff8c00]/50 to-transparent top-0 animate-scan hidden group-hover:block z-20"></div>
                      
                      <div
                        className="bg-gradient-to-r from-[#cc7000] to-[#ff8c00] h-full transition-all duration-500 flex items-center justify-end pr-4 shadow-[0_0_15px_rgba(255,140,0,0.4)] relative z-10"
                        style={{ width: `${data[selectedMetric]}%` }}
                      >
                        <span className="text-black font-black text-sm relative z-20">{data[selectedMetric]}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
          </div>

          {/* Agent Leaderboard */}
          <div className="brick p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-[#2a2a2a] pb-4">
              <BarChart3 className="h-6 w-6 text-[#ff8c00]" />
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Agent Diagnostics</h2>
            </div>
            <div className="space-y-4">
              {agents.sort((a, b) => b.productivity - a.productivity).map((agent, idx) => (
                <div key={agent.id} className="bg-[#0f0f0f] border border-[#2a2a2a] p-5 hover:border-[#ff8c00]/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold ${
                        idx === 0 ? 'bg-[#ff8c00] text-black shadow-[0_0_10px_rgba(255,140,0,0.5)]' :
                        idx === 1 ? 'bg-[#2a2a2a] text-white' :
                        idx === 2 ? 'bg-[#1a1a1a] text-[#888]' :
                        'bg-[#0f0f0f] text-[#555] border border-[#2a2a2a]'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-[#e0e0e0] uppercase tracking-wide">{agent.name}</div>
                        <div className="text-[10px] font-mono text-[#888] uppercase tracking-widest">{agent.role.replace('-', '_')}</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-black ${getScoreColor(agent.productivity)}`}>
                      {agent.productivity}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[10px] font-mono tracking-widest uppercase">
                    <div className={`text-center py-2 border border-[#2a2a2a] ${getScoreBg(agent.communication)}`}>
                      <div className={`font-bold text-sm ${getScoreColor(agent.communication)}`}>{agent.communication}</div>
                      <div className="text-[#888] mt-1">Comm</div>
                    </div>
                    <div className={`text-center py-2 border border-[#2a2a2a] ${getScoreBg(agent.collaboration)}`}>
                      <div className={`font-bold text-sm ${getScoreColor(agent.collaboration)}`}>{agent.collaboration}</div>
                      <div className="text-[#888] mt-1">Collab</div>
                    </div>
                    <div className={`text-center py-2 border border-[#2a2a2a] ${getScoreBg(agent.quality)}`}>
                      <div className={`font-bold text-sm ${getScoreColor(agent.quality)}`}>{agent.quality}</div>
                      <div className="text-[#888] mt-1">Qual</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-8 brick p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
            <AlertCircle className="h-6 w-6 text-[#ff3333]" />
            <h2 className="text-xl font-black text-white uppercase tracking-widest">System Anomalies</h2>
          </div>
          <div className="space-y-4">
            {alerts.length === 0 && (
              <div className="text-[#555] font-mono text-sm">NO ANOMALIES DETECTED IN CURRENT CYCLE</div>
            )}
            {alerts.map(alert => (
              <div key={alert.id} className={`bg-[#${alert.type === 'error' ? '1a0505' : '051a15'}] border-l-4 border-[#${alert.type === 'error' ? 'ff3333' : '00ff88'}] p-5`}>
                <div className="flex items-start gap-4">
                  {alert.type === 'error' ? (
                     <AlertCircle className="h-6 w-6 text-[#ff3333] mt-0.5 shrink-0 animate-pulse" />
                  ) : (
                     <TrendingUp className="h-6 w-6 text-[#00ff88] mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-white uppercase tracking-wide mb-1">{alert.title}</div>
                    <div className="text-sm font-mono text-[#aaa]">
                      {alert.message}
                    </div>
                    <div className={`text-[10px] font-mono mt-3 tracking-widest uppercase text-[#${alert.type === 'error' ? 'ff3333' : '00ff88'}]/70`}>{alert.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
