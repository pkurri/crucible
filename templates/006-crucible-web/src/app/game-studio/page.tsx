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
  { id: 'PULSE',    emoji: '📊', label: 'Market Analyst',        color: '#00bcd4' },
  { id: 'SCHEMA',   emoji: '📋', label: 'Requirement Vetter',    color: '#9c27b0' },
  { id: 'DISPATCH', emoji: '📁', label: 'Project Manager',       color: '#ff9800' },
  { id: 'PIXEL',    emoji: '💻', label: 'Software Engineer',     color: '#4caf50' },
  { id: 'GLITCH',   emoji: '🐛', label: 'QA & Debugger',         color: '#f44336' },
  { id: 'TURBO',    emoji: '⚡', label: 'Performance Optimizer', color: '#ffeb3b' },
  { id: 'GATEWAY',  emoji: '🏪', label: 'Store Policy Expert',   color: '#2196f3' },
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
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #00bcd4, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '.25rem' }}>
          ⚡ Neon Arcade
        </h1>
        <p style={{ color: '#888', fontSize: '.95rem' }}>AI Game Studio — MAINFRAME Orchestrator</p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: '0 auto 2rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <textarea
          value={gameIdea}
          onChange={e => setGameIdea(e.target.value)}
          placeholder="Describe your game idea… e.g. 'A casual match-3 puzzle game with power-ups and daily challenges'"
          rows={3}
          style={{ flex: 1, minWidth: 300, background: '#13131a', border: '1px solid #333', borderRadius: 10, padding: '1rem', color: '#e0e0e0', fontSize: '.95rem', resize: 'vertical' }}
        />
        <button
          type="submit"
          disabled={submitting || !gameIdea.trim()}
          style={{ alignSelf: 'flex-end', padding: '.8rem 1.8rem', background: 'linear-gradient(135deg, #00bcd4, #9c27b0)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: submitting ? .6 : 1 }}
        >
          {submitting ? 'Launching…' : '🚀 Launch Pipeline'}
        </button>
      </form>
      {error && <p style={{ color: '#f44336', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

      {/* Progress bar */}
      {job && (
        <div style={{ maxWidth: 700, margin: '0 auto 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem', fontSize: '.85rem' }}>
            <span style={{ color: '#aaa' }}>Job: <code style={{ color: '#00bcd4' }}>{job.id.slice(0, 8)}…</code></span>
            <span style={{ color: job.status === 'COMPLETE' ? '#4caf50' : job.status === 'FAILED' ? '#f44336' : '#ff9800', fontWeight: 700 }}>{job.status}</span>
          </div>
          <div style={{ height: 8, background: '#1e1e2a', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${job.progress}%`, background: 'linear-gradient(90deg, #00bcd4, #9c27b0)', borderRadius: 4, transition: 'width .5s' }} />
          </div>
        </div>
      )}

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
        <div style={{ maxWidth: 700, margin: '0 auto', background: '#0d0d14', border: '1px solid #222', borderRadius: 12, padding: '1rem' }}>
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
    </main>
  );
}
