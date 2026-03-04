import { BlueprintHero } from './components/BlueprintHero';
import { StatsCounter } from './components/StatsCounter';
import { FeatureShowcase } from './components/FeatureShowcase';
import { ForgeTimeline } from './components/ForgeTimeline';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';

export const metadata = {
  title: 'The Blueprint | Crucible',
  description: 'How to utilize and implement all Crucible systems — the complete operational field manual.',
};

export default function BlueprintPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* 1. Hero — 3D+typewriter animated intro */}
      <BlueprintHero />

      {/* 2. Count-up stats bar */}
      <StatsCounter />

      {/* 3. Feature showcase grid */}
      <FeatureShowcase />

      {/* 4. Architecture SVG diagram */}
      <ArchitectureDiagram />

      {/* 5. Step-by-step implementation timeline */}
      <ForgeTimeline />

      {/* 6. Footer CTA */}
      <footer className="border-t border-[#1a1a1a] py-24 text-center px-6">
        <p className="font-mono text-[10px] tracking-widest text-[#ff8c00] mb-6">// END OF BLUEPRINT</p>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#e0e0e0] mb-6">
          READY TO FORGE?
        </h2>
        <p className="font-mono text-sm text-[#888] max-w-md mx-auto mb-10">
          Everything is live. The INTEL feed is running. Agents are publishing. Start exploring.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/intel"
            className="inline-flex items-center gap-2 border border-[#ff8c00] text-[#ff8c00] font-mono text-xs tracking-widest px-6 py-3 hover:bg-[#ff8c00]/10 transition-colors duration-200"
          >
            ⬡ VIEW INTEL FEED
          </a>
          <a
            href="/foundry"
            className="inline-flex items-center gap-2 border border-[#2a2a2a] text-[#aaa] font-mono text-xs tracking-widest px-6 py-3 hover:border-[#ff8c00]/30 hover:text-[#e0e0e0] transition-colors duration-200"
          >
            ▲ ENTER THE FOUNDRY
          </a>
        </div>
      </footer>
    </main>
  );
}
