'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────

interface AgentResult {
  agent: string;
  phase: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  started_at?: string;
  ended_at?: string;
}

interface LogEntry {
  agent: string;
  level: string;
  message: string;
  created_at: string;
}

interface JobStatus {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'PAUSED_CHECKPOINT' | 'COMPLETE' | 'FAILED';
  current_agent: string | null;
  progress: number;
  error_message?: string;
  completed_at?: string;
}

// ─── Agent metadata ─────────────────────────────────────

const AGENTS = [
  { id: 'VANGUARD', emoji: '🔭', label: 'Aggressive Scouter',      color: '#ff5722', isPro: true },
  { id: 'ORACLE',   emoji: '🔮', label: 'Trend Forecaster',      color: '#ff9800', isPro: true },
  { id: 'PULSE',    emoji: '📊', label: 'Market Analyst',        color: '#00bcd4', isPro: false },
  { id: 'SCHEMA',   emoji: '📋', label: 'Requirement Vetter',    color: '#9c27b0', isPro: false },
  { id: 'DISPATCH', emoji: '📁', label: 'Project Manager',       color: '#ff9800', isPro: false },
  { id: 'PIXEL',    emoji: '💻', label: 'Software Engineer',     color: '#4caf50', isPro: true },
  { id: 'GLITCH',   emoji: '🐛', label: 'QA & Debugger',         color: '#f44336', isPro: true },
  { id: 'TURBO',    emoji: '⚡', label: 'Performance Optimizer', color: '#ffeb3b', isPro: true },
  { id: 'DOPAMINE', emoji: '🧠', label: 'Retention Architect',    color: '#00bcd4', isPro: true },
  { id: 'SENSORY',  emoji: '🌈', label: 'Juice Architect',        color: '#e91e63', isPro: true },
  { id: 'SPECTRA',  emoji: '🎮', label: 'Playtest & Balance',    color: '#00ff88', isPro: true },
  { id: 'SENTINEL', emoji: '🛡️', label: 'Steering & Safety',     color: '#ffc107', isPro: true },
  { id: 'GATEWAY',  emoji: '🏪', label: 'Store Policy Expert',   color: '#2196f3', isPro: true },
  { id: 'GLITCH_MOD', emoji: '🤳', label: 'Hype & Social',       color: '#ff4081', isPro: true },
  { id: 'VIRAL',    emoji: '🚀', label: 'Growth Engineer',       color: '#00ff88', isPro: true },
  { id: 'UA_PRO',   emoji: '📈', label: 'Acquisition Strategist', color: '#ffc107', isPro: true },
  { id: 'AUDITOR',  emoji: '🔍', label: 'Evaluation & ROI',      color: '#00bcd4', isPro: true },
  { id: 'CHRONOS',  emoji: '⏳', label: 'Procedural Director',   color: '#aaa',    isPro: true },
];

// ─── Component ──────────────────────────────────────────

export default function GameStudioPage() {
  const [gameIdea, setGameIdea]     = useState('');
  const [jobId, setJobId]           = useState<string | null>(null);
  const [job, setJob]               = useState<JobStatus | null>(null);
  const [agents, setAgents]         = useState<AgentResult[]>([]);
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // ── Poll job status ────────────────────────────────────

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const res  = await fetch(`/api/game-studio/pipeline?jobId=${jobId}`);
        const data = await res.json();
        setJob(data.job);
        setAgents(data.agents || []);
        setLogs(data.logs || []);

        if (['COMPLETE', 'FAILED'].includes(data.job?.status)) {
          clearInterval(pollRef.current);
        }
      } catch (e) {
        console.error('Poll error', e);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [jobId]);

  // ── Submit new job ─────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameIdea.trim()) return;
    setSubmitting(true);
    setError('');
    setJobId(null);
    setJob(null);
    setAgents([]);
    setLogs([]);

    try {
      const res  = await fetch('/api/game-studio/pipeline', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ gameIdea: gameIdea.trim(), targetPlatform: 'web' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start pipeline');
      setJobId(data.jobId);
    } catch (e: any) {
      console.error('Submit error:', e);
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Checkpoint decision ────────────────────────────────

  const handleCheckpoint = async (decision: 'approve' | 'reject') => {
    await fetch('/api/game-studio/checkpoint', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ jobId, decision }),
    });
  };

  // ── Agent status helpers ───────────────────────────────

  const getAgentStatus = (agentId: string): AgentResult['status'] =>
    agents.find(a => a.agent === agentId)?.status || 'PENDING';

  const statusColor = (s: AgentResult['status']) => ({
    PENDING:  '#555',
    RUNNING:  '#ff9800',
    COMPLETE: '#4caf50',
    FAILED:   '#f44336',
  }[s]);

  // ── Render ─────────────────────────────────────────────

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #00bcd4, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '.25rem', letterSpacing: '-0.02em' }}>
          Neon Arcade
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
          <p style={{ color: '#888', fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Autonomous Game Engine</p>
          <span style={{ padding: '2px 8px', background: 'rgba(0, 188, 212, 0.1)', border: '1px solid #00bcd4', borderRadius: 4, color: '#00bcd4', fontSize: '0.65rem', fontWeight: 'bold' }}>VERSION 2.4</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        <div>
          {/* Input form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap', background: '#13131a', padding: '1.5rem', borderRadius: 16, border: '1px solid #222' }}>
            <textarea
              value={gameIdea}
              onChange={e => setGameIdea(e.target.value)}
              placeholder="Describe your game idea… e.g. 'A casual match-3 puzzle game with power-ups and daily challenges'"
              rows={3}
              style={{ flex: 1, minWidth: 300, background: '#0a0a0f', border: '1px solid #333', borderRadius: 10, padding: '1rem', color: '#e0e0e0', fontSize: '.95rem', resize: 'none' }}
            />
            <button
              type="submit"
              disabled={submitting || !gameIdea.trim()}
              style={{ alignSelf: 'center', padding: '1rem 2rem', background: 'linear-gradient(135deg, #00bcd4, #00ff88)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.2s', opacity: submitting ? 0.6 : 1 }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {submitting ? 'Forging...' : 'Launch Pipeline'}
            </button>
          </form>

          {error && (
            <div style={{ background: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336', color: '#f44336', padding: '1rem', borderRadius: 12, marginBottom: '2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Arena / Live Preview */}
          <div style={{ background: '#000', borderRadius: 16, border: '1px solid #333', height: 400, marginBottom: '2rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!jobId ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🎮</div>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>Enter a game idea to activate the Live Test Arena</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {/* Simulated Game Loop for Visualization */}
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  width: 60, height: 60,
                  background: 'linear-gradient(45deg, #00bcd4, #9c27b0)',
                  borderRadius: 8,
                  animation: 'pulse 2s infinite ease-in-out'
                }} />
                <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#00ff88', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                   ARENA STATUS: RUNNING AGENT LOOPS...
                </div>
                <canvas id="arena-canvas" width="800" height="400" style={{ opacity: 0.4 }} />
              </div>
            )}
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '0.5rem' }}>
              <span style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.6rem', border: '1px solid #333', borderRadius: '4px' }}>FPS: {(Math.random() * 5 + 55).toFixed(0)}</span>
              <span style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.6rem', border: '1px solid #333', borderRadius: '4px' }}>MEM: 24.1MB</span>
            </div>
          </div>
        </div>

        <div>
          {/* Progress bar */}
          {job && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem', fontSize: '.85rem' }}>
                <span style={{ color: '#aaa' }}>Task Progress</span>
                <span style={{ color: job.status === 'COMPLETE' ? '#4caf50' : job.status === 'FAILED' ? '#f44336' : '#ff9800', fontWeight: 700 }}>{job.status}</span>
              </div>
              <div style={{ height: 6, background: '#1e1e2a', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${job.progress}%`, background: 'linear-gradient(90deg, #00bcd4, #00ff88)', borderRadius: 4, transition: 'width .5s' }} />
              </div>
            </div>
          )}

          {/* Agent status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Fleet Command</h3>
            {AGENTS.map(ag => {
              const status = getAgentStatus(ag.id);
              return (
                <div 
                  key={ag.id} 
                  style={{ 
                    background: status === 'RUNNING' ? 'rgba(0, 188, 212, 0.05)' : '#13131a', 
                    border: `1px solid ${status === 'COMPLETE' ? ag.color : status === 'RUNNING' ? '#00bcd4' : '#222'}`, 
                    borderRadius: 12, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', filter: status === 'PENDING' ? 'grayscale(1)' : 'none' }}>{ag.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: status === 'PENDING' ? '#555' : '#fff' }}>{ag.id}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{ag.label}</div>
                  </div>
                  {ag.isPro && (
                    <span style={{ padding: '2px 6px', background: '#00bcd4', color: '#000', fontSize: '0.55rem', fontWeight: 'bold', borderRadius: 4 }}>PRO</span>
                  )}
                  {status === 'RUNNING' && (
                    <div style={{ width: 8, height: 8, background: '#00bcd4', borderRadius: '50%', boxShadow: '0 0 10px #00bcd4' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Checkpoint banner */}
      {job?.status === 'PAUSED_CHECKPOINT' && (
        <div style={{ maxWidth: 700, margin: '0 auto 1.5rem', background: '#1a130a', border: '1px solid #ff9800', borderRadius: 12, padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#ff9800', marginBottom: '.25rem' }}>🔒 Human Checkpoint — PULSE Complete</div>
            <div style={{ fontSize: '.88rem', color: '#ccc' }}>Review the market analysis before proceeding to development.</div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button onClick={() => handleCheckpoint('approve')} style={{ padding: '.6rem 1.4rem', background: '#4caf50', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>✅ Approve</button>
            <button onClick={() => handleCheckpoint('reject')}  style={{ padding: '.6rem 1.4rem', background: '#f44336', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>❌ Reject</button>
          </div>
        </div>
      )}

      {/* Agent grid */}
      {jobId && (
        <div style={{ maxWidth: 700, margin: '0 auto 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
          {AGENTS.map(ag => {
            const status = getAgentStatus(ag.id);
            return (
              <div key={ag.id} style={{ background: '#13131a', border: `1px solid ${status === 'COMPLETE' ? ag.color : '#272730'}`, borderRadius: 12, padding: '1rem', transition: 'border-color .3s' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>{ag.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: ag.color }}>{ag.id}</div>
                <div style={{ fontSize: '.78rem', color: '#777', marginBottom: '.5rem' }}>{ag.label}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 600, color: statusColor(status) }}>● {status}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto 2rem', background: '#0d0d14', border: '1px solid #222', borderRadius: 12, padding: '1rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '.6rem', fontSize: '.88rem', color: '#888' }}>📜 Pipeline Logs</div>
          <div style={{ maxHeight: 220, overflowY: 'auto', fontSize: '.8rem', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
            {logs.map((l, i) => (
              <div key={i} style={{ color: l.level === 'error' ? '#f44336' : l.level === 'warn' ? '#ff9800' : '#aaa' }}>
                <span style={{ color: '#555', marginRight: '.5rem' }}>{new Date(l.created_at).toLocaleTimeString()}</span>
                <span style={{ color: '#00bcd4', marginRight: '.5rem' }}>[{l.agent}]</span>
                {l.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.8; box-shadow: 0 0 20px rgba(0, 188, 212, 0.2); }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; box-shadow: 0 0 40px rgba(0, 188, 212, 0.4); }
          100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.8; box-shadow: 0 0 20px rgba(0, 188, 212, 0.2); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .arena-scan {
          position: absolute;
          top: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(0, 255, 136, 0.05), transparent);
          animation: scanline 4s linear infinite;
          pointer-events: none;
        }
        .data-particle {
          position: absolute;
          width: 2px; height: 2px;
          background: #00ff88;
          border-radius: 50%;
          animation: float 3s infinite linear;
        }
      `}</style>
      <div className="arena-scan" />
    </main>
  );
}
