'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Video, 
  DollarSign, 
  PlayCircle, 
  Layers, 
  Activity, 
  Zap, 
  ShieldCheck,
  LayoutGrid,
  BarChart3
} from 'lucide-react';

// Mock data initially, in production this would fetch from an API route reading yt-empire-state.json
const INITIAL_CHANNELS = [
  { id: 1, name: 'PlayfulPixels', niche: 'Kids Learning', subs: '5,321', videos: 13, rev: '$501.00', status: 'Producing Script...', progress: 45 },
  { id: 2, name: 'DreamyDragons', niche: 'Bedtime Stories', subs: '3,142', videos: 8, rev: '$210.80', status: 'Asset Generation', progress: 12 },
  { id: 3, name: 'BlockBuddyAcademy', niche: 'Minecraft Roleplay', subs: '12,639', videos: 16, rev: '$1,261.02', status: 'Idle', progress: 0 }
];

const STATS = [
  { label: 'Total Empire Subs', value: '21,102', icon: <Users size={20} />, trend: '+12%' },
  { label: 'Total Revenue (All)', value: '$1,972.82', icon: <DollarSign size={20} />, trend: '+8.4%' },
  { label: 'Total Videos Prod.', value: '37', icon: <PlayCircle size={20} />, trend: '+5' },
  { label: 'Active Swarms', value: '4/4', icon: <Zap size={20} />, trend: 'Stable' }
];

export default function Dashboard() {
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>Autonomous YouTube Industry</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Crucible Empire Manager · Agent Division 101</p>
        </div>
        <div className="status-badge">
          <div className="status-dot"></div>
          Fleet Connected
        </div>
      </header>

      <section className="stats-grid">
        {STATS.map((stat, i) => (
          <motion.div 
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">{stat.label}</div>
              <div style={{ color: 'hsl(var(--accent-teal))' }}>{stat.icon}</div>
            </div>
            <div className="card-value">{stat.value}</div>
            <div className="card-footer">
              <TrendingUp size={14} />
              {stat.trend} from last week
            </div>
          </motion.div>
        ))}
      </section>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div className="channel-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Active Channels</h2>
            <div style={{ fontSize: '0.875rem', display: 'flex', gap: '1rem', color: 'hsl(var(--text-muted))' }}>
              <button style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid hsla(var(--glass-border))', color: 'white' }}>Filter</button>
              <button style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>+ Create Channel</button>
            </div>
          </div>
          
          <AnimatePresence>
            {channels.map((ch, i) => (
              <motion.div 
                key={ch.id}
                className="channel-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div>
                  <div className="channel-name">{ch.name}</div>
                  <div className="channel-blueprint">{ch.niche}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'hsl(var(--accent-teal))', fontWeight: 600 }}>{ch.status}</span>
                    <span style={{ color: 'hsl(var(--text-muted))' }}>{ch.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <motion.div 
                      className="progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${ch.progress}%` }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Subscribers</div>
                  <div style={{ fontWeight: 700 }}>{ch.subs}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Videos</div>
                  <div style={{ fontWeight: 700 }}>{ch.videos}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--accent-teal))' }}>{ch.rev}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="aside">
          <motion.div 
            className="card" 
            style={{ height: '100%', padding: '1.5rem' }}
            initial={{ opacity: 0, opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} /> Production Logs
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              {[
                { time: '2m ago', msg: 'LyricSmith finalized "Color Song" script' },
                { time: '15m ago', msg: 'Echo Voice output master 48kHz for PlayfulPixels' },
                { time: '40m ago', msg: 'Channel Warden scheduled video YT_9921_Block' },
                { time: '1h ago', msg: 'Market Scout identified new Kids Phonics trend' }
              ].map((log, i) => (
                <div key={i} style={{ borderLeft: '2px solid hsla(var(--glass-border))', paddingLeft: '1rem', position: 'relative' }}>
                  <div style={{ width: '8px', height: '8px', background: 'hsl(var(--accent-teal))', borderRadius: '50%', position: 'absolute', left: '-5px', top: '5px' }}></div>
                  <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>{log.time}</div>
                  <div style={{ fontWeight: 500 }}>{log.msg}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <footer style={{ marginTop: 'auto', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid hsla(var(--glass-border))', color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>
        <p>© 2026 Crucible Industrial · All Rights Reserved · Powered by Forge Pro</p>
      </footer>
    </div>
  );
}
