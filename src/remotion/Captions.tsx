import React, { useEffect, useState } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import fs from 'fs';

interface Caption {
  start: number;
  end: number;
  text: string;
}

export interface CaptionsProps {
  vttPath: string;
}

export const Captions: React.FC<CaptionsProps> = ({ vttPath }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [captions, setCaptions] = useState<Caption[]>([]);

  useEffect(() => {
    if (!vttPath || !fs.existsSync(vttPath)) return;
    
    const vttContent = fs.readFileSync(vttPath, 'utf-8');
    const parsed = parseVTT(vttContent, fps);
    setCaptions(parsed);
  }, [vttPath, fps]);

  const currentTime = frame / fps;
  const currentCaption = captions.find(
    (cap) => currentTime >= cap.start && currentTime <= cap.end
  );

  if (!currentCaption) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 500, // Position above UI elements
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          textShadow: '0 0 10px black, 0 0 20px black',
          padding: '10px 20px',
          maxWidth: '90%',
        }}
      >
        {currentCaption.text}
      </div>
    </AbsoluteFill>
  );
};

function parseVTT(vttContent: string, fps: number): Caption[] {
  const lines = vttContent.split('\n');
  const captions: Caption[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match timestamp lines (e.g., "00:00:00.000 --> 00:00:05.000")
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->').map(s => s.trim());
      const start = parseTimestamp(startStr);
      const end = parseTimestamp(endStr);
      
      // Next line should be the caption text
      const text = lines[i + 1]?.trim() || '';
      
      if (text) {
        captions.push({ start, end, text });
      }
    }
  }
  
  return captions;
}

function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const seconds = parseFloat(parts[2] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}
