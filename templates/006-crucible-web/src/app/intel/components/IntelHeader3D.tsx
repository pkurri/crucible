'use client';

import dynamic from 'next/dynamic';

const IntelParticleField = dynamic(
  () => import('./IntelParticleField').then((m) => m.IntelParticleField),
  { ssr: false }
);

export function IntelHeader3D() {
  return (
    <div className="absolute inset-0 -mx-6 pointer-events-none">
      <IntelParticleField />
    </div>
  );
}
