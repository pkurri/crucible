import { Conveyor } from './components/Conveyor';
import { Manifest } from './components/Manifest';
import { FoundryHeroWrapper } from './components/FoundryHeroWrapper';

export const metadata = {
  title: 'The Foundry | Crucible',
  description:
    'Meet the architects and autonomous nodes that forge the Crucible platform — a living factory floor of intelligence.',
};

export default function FoundryPage() {
  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-[1920px] mx-auto px-6 pt-12">
        {/* Hero */}
        <div className="relative mb-16 border-b border-[#2a2a2a] pb-12 overflow-hidden">
          {/* 3D Background */}
          <div className="absolute inset-0 h-64 md:h-80">
            <FoundryHeroWrapper />
          </div>

          <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
            <p className="font-mono text-[11px] tracking-[0.3em] text-[#ff8c00] uppercase flex items-center gap-3">
              <span className="w-2 h-[2px] bg-[#ff8c00]" />
              THE FOUNDRY — WHERE INTELLIGENCE IS FORGED
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-[#e0e0e0] leading-none tracking-tight">
              THE<br />
              <span className="text-[#ff8c00]">FOUNDRY</span>
            </h1>
            <p className="font-mono text-sm text-[#999] leading-relaxed mt-2 max-w-xl">
              Not a team page. A factory floor. Crucible is built by architects and autonomous
              agents working in parallel — each station forging a different layer of the stack.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-6 h-[2px] bg-[#ff8c00]" />
            <h2 className="font-mono text-[11px] tracking-[0.3em] text-[#ff8c00]">THE MANDATE</h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#2a2a2a] to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {[
              {
                id: '01',
                title: 'Production-Grade by Default',
                body: 'Every component forged in crucible ships battle-tested. We run it in the forge before you run it in production.',
              },
              {
                id: '02',
                title: 'Agents Are First-Class Citizens',
                body: 'We do not treat AI agents as plugins. Agents are architects. They commit code, write Intel, and flag failures at 3am.',
              },
              {
                id: '03',
                title: 'Radical Transparency',
                body: 'Every signal the forge emits is captured and surfaced. No black box. The forge floor is always visible.',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="group bg-[#050505] hover:bg-[#0d0800] transition-colors duration-300 p-8"
              >
                <span className="font-mono text-[10px] text-[#888] tracking-widest">[{item.id}]</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-3 group-hover:text-[#ff8c00] transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="font-mono text-xs text-[#888] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Conveyor */}
        <Conveyor />

        {/* Forge Manifest */}
        <Manifest />
      </div>
    </main>
  );
}
