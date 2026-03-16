'use client';

import React from 'react';
import Link from 'next/link';

export default function NeonSyndicateShowcase() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#020205', 
      color: '#fff', 
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden' 
    }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: '90vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(0, 255, 136, 0.1) 0%, transparent 70%)',
        textAlign: 'center',
        padding: '0 1rem'
      }}>
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <Link href="/game-studio" style={{ color: '#00ff88', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>
            ← BACK TO FORGE
          </Link>
        </div>

        <div style={{ 
          padding: '4px 12px', 
          background: 'rgba(0, 255, 136, 0.1)', 
          border: '1px solid #00ff88', 
          borderRadius: '100px',
          color: '#00ff88',
          fontSize: '0.7rem',
          fontWeight: 800,
          letterSpacing: '0.2em',
          marginBottom: '1.5rem',
          animation: 'glow 2s infinite alternate'
        }}>
          AGENT-CRAFTED FLAGSHIP
        </div>

        <h1 style={{ 
          fontSize: 'clamp(3rem, 10vw, 6rem)', 
          fontWeight: 900, 
          margin: 0, 
          lineHeight: 0.9,
          background: 'linear-gradient(to bottom, #fff 0%, #00ff88 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '-0.04em'
        }}>
          NEON<br/>SYNDICATE
        </h1>
        
        <p style={{ maxWidth: 600, color: '#888', fontSize: '1.1rem', marginTop: '1.5rem', lineHeight: 1.6 }}>
          The world's first rogue-lite deckbuilder autonomously developed, balanced, and 
          optimized by the <strong>Crucible Gaming Fleet</strong>.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
          <button style={{ 
            padding: '1.2rem 3rem', 
            background: '#00ff88', 
            color: '#000', 
            border: 'none', 
            borderRadius: 8, 
            fontWeight: 800, 
            fontSize: '1rem', 
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
          }}>
            ENTER THE HEIST
          </button>
          <button style={{ 
            padding: '1.2rem 3rem', 
            background: 'transparent', 
            color: '#fff', 
            border: '1px solid #333', 
            borderRadius: 8, 
            fontWeight: 800, 
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            VIEW BLUEPRINTS
          </button>
        </div>
      </section>

      {/* The "Built By" Grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 2rem' }}>
        <h2 style={{ fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.3em', textAlign: 'center', marginBottom: '4rem' }}>
          Autonomous Architectural Layers
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Oracle Card */}
          <div style={{ background: '#0a0a0f', padding: '2.5rem', borderRadius: 24, border: '1px solid #111' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>🔮</div>
            <h3 style={{ color: '#00ff88', fontSize: '1.4rem', marginBottom: '1rem' }}>Oracle Protocol</h3>
            <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Scanned 14,000 Steam data points to identify the "Cyber-Deckbuilder" gap. 
              Predicted high engagement for "Glitch-core" aesthetics.
            </p>
          </div>

          {/* Dopamine Card */}
          <div style={{ background: '#0a0a0f', padding: '2.5rem', borderRadius: 24, border: '1px solid #111' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>🧠</div>
            <h3 style={{ color: '#00bcd4', fontSize: '1.4rem', marginBottom: '1rem' }}>Dopamine Core</h3>
            <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Engineered the "Neural Loop" retention engine. 
              Calculated exactly 4.2 minute session lengths for 92% D1 retention.
            </p>
          </div>

          {/* Chronos Card */}
          <div style={{ background: '#0a0a0f', padding: '2.5rem', borderRadius: 24, border: '1px solid #111' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>⏳</div>
            <h3 style={{ color: '#ff9800', fontSize: '1.4rem', marginBottom: '1rem' }}>Chronos Engine</h3>
            <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Procedural level generation that adapts to player skill. 
              No two Neural Heists are ever the same.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Teaser */}
      <section style={{ padding: '4rem 0', textAlign: 'center', background: '#050508' }}>
        <div style={{ 
          maxWidth: 900, 
          margin: '0 auto', 
          height: 500, 
          background: 'linear-gradient(45deg, #0a0a14 0%, #1a1a2e 100%)',
          borderRadius: 32,
          border: '1px solid #222',
          position: 'relative',
          overflow: 'hidden'
        }}>
           <div style={{ 
             position: 'absolute', 
             top: '50%', 
             left: '50%', 
             transform: 'translate(-50%, -50%)',
             color: '#00ff88',
             opacity: 0.2,
             fontSize: '8rem',
             fontWeight: 900
           }}>
             G-LIVE
           </div>
           
           {/* UI Mock Overlay */}
           <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: '1rem' }}>
             <div style={{ width: 120, height: 10, background: '#333', borderRadius: 5 }}>
                <div style={{ width: '60%', height: '100%', background: '#00ff88', borderRadius: 5 }} />
             </div>
             <div style={{ width: 80, height: 10, background: '#333', borderRadius: 5 }}>
                <div style={{ width: '30%', height: '100%', background: '#00bcd4', borderRadius: 5 }} />
             </div>
           </div>
           
           <div style={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center' }}>
              <p style={{ color: '#00ff88', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.2em' }}>
                &gt; INITIALIZING AGENT-BALANCED COMBAT LOOPS...
              </p>
           </div>
        </div>
      </section>

      <footer style={{ padding: '6rem 2rem', borderTop: '1px solid #111', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: '0.8rem' }}>
          BUILT AT INDUSTRIAL SCALE BY THE CRUCIBLE FORGE.
        </p>
      </footer>

      <style jsx global>{`
        @keyframes glow {
          0% { box-shadow: 0 0 10px rgba(0, 255, 绿, 0.1); }
          100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
        }
      `}</style>
    </div>
  );
}
