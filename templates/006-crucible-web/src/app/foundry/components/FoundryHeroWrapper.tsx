'use client';

import dynamic from 'next/dynamic';

const FoundryHero3DCanvas = dynamic(
  () => import('./FoundryHero3D').then((m) => m.FoundryHero3D),
  { ssr: false }
);

export function FoundryHeroWrapper() {
  return <FoundryHero3DCanvas />;
}
