'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Globe.gl
const Globe = dynamic(() => import('react-globe.gl').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#050505] animate-pulse">
      <p className="font-mono text-[10px] text-[#ff8c00] tracking-widest uppercase">Initializing Orbital Render...</p>
    </div>
  )
});

interface WorldGlobeProps {
  signals: any[];
}

export default function WorldGlobe({ signals }: WorldGlobeProps) {
  const globeRef = useRef<any>(null);
  const [globeData, setGlobeData] = useState<any[]>([]);

  useEffect(() => {
    // Convert signals to globe data format (points/labels)
    // For demo purposes, we'll randomize coordinates if not present
    const data = signals.map(s => ({
      lat: s.metadata?.lat || (Math.random() - 0.5) * 180,
      lng: s.metadata?.lng || (Math.random() - 0.5) * 360,
      size: s.severity === 'critical' ? 0.8 : s.severity === 'high' ? 0.5 : 0.2,
      color: s.severity === 'critical' ? '#ff0000' : s.severity === 'high' ? '#ff8c00' : '#00ecff',
      label: s.title
    }));
    setGlobeData(data);
  }, [signals]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={true}
        atmosphereColor="#ff8c00"
        atmosphereAltitude={0.15}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={globeData}
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.5}
        pointsMerge={true}
        pointLabel="label"
        onGlobeClick={() => {}}
      />
      {/* HUD OVERLAY ON TOP OF GLOBE */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-[#ff8c00]/5 rounded-3xl" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]/80" />
    </div>
  );
}
