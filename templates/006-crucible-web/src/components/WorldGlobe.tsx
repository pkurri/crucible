'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

interface GlobalSignal {
  id: string;
  lat: number;
  lng: number;
  category: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  timestamp?: string;
}

export default function WorldGlobe({ signals = [] }: { signals?: GlobalSignal[] }) {
  const globeEl = useRef<GlobeMethods>();
  
  // Custom colors for categories
  const getSignalColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fire': return '#f87171';
      case 'market': return '#fbbf24';
      case 'tech': return '#3b82f6';
      case 'radiation': return '#10b981';
      default: return '#ff8c00';
    }
  };

  useEffect(() => {
    if (globeEl.current) {
      // Auto-rotate
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      
      // Initial viewpoint
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, []);

  return (
    <div className="w-full h-full relative cursor-crosshair">
      <Globe
        ref={globeEl}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={signals}
        pointLat="lat"
        pointLng="lng"
        pointColor={d => getSignalColor((d as GlobalSignal).category)}
        pointAltitude={d => (d as GlobalSignal).severity === 'critical' ? 0.3 : 0.1}
        pointRadius={d => (d as GlobalSignal).severity === 'critical' ? 1.5 : 0.8}
        pointsMerge={true}
        pointLabel={d => `
          <div style="background: rgba(0,0,0,0.85); border: 1px solid #ff8c00; padding: 10px; border-radius: 8px; font-family: monospace;">
             <p style="color: #ff8c00; font-size: 10px; margin: 0;">SIGNAL: ${(d as GlobalSignal).category.toUpperCase()}</p>
             <p style="color: white; font-weight: bold; margin: 4px 0;">${(d as GlobalSignal).title}</p>
             <p style="color: #666; font-size: 9px; margin: 0;">${new Date((d as GlobalSignal).timestamp || '').toLocaleTimeString()}</p>
          </div>
        `}
        // Rings for critical signals
        ringsData={signals.filter(s => s.severity === 'critical' || s.severity === 'high')}
        ringColor={() => '#ff8c00'}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1000}
      />
    </div>
  );
}
