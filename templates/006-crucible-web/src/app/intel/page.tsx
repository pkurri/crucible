import { supabase, Transmission } from '@/lib/supabase';
import { StatsBar } from './components/StatsBar';
import { IntelFeed } from './components/IntelFeed';
import { IntelHeader3D } from './components/IntelHeader3D';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchTransmissions(): Promise<Transmission[]> {
  const { data, error } = await supabase
    .from('transmissions')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching transmissions:', error);
    return [];
  }
  return data as Transmission[];
}

export default async function IntelPage() {
  const transmissions = await fetchTransmissions();

  return (
    <main className="min-h-screen pb-24">
      {/* Live Stats Bar */}
      <StatsBar transmissions={transmissions} />

      <div className="max-w-[1920px] mx-auto px-6 pt-12">
        {/* Header with 3D particle field */}
        <div className="relative mb-12 border-b border-[#2a2a2a] pb-8 overflow-hidden">
          <IntelHeader3D />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-[#e0e0e0] mb-3 tracking-tight">
                INTEL
              </h1>
              <p className="font-mono text-[#ff8c00] text-sm tracking-widest uppercase flex items-center gap-3">
                <span className="w-2 h-2 bg-[#ff8c00] animate-pulse rounded-full" />
                DECRYPTED TRANSMISSIONS — LIVE FORGE FEED
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-[3px] h-8 bg-[#ff8c00] shadow-[0_0_8px_#ff8c00]" />
                <span className="text-[#888]">AUTONOMOUS NODE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[3px] h-8 bg-[#e0e0e0]/30" />
                <span className="text-[#888]">HUMAN ARCHITECT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <IntelFeed initial={transmissions} />
        
        {transmissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 font-mono text-[#333]">
            <div className="text-4xl mb-4">◈</div>
            <p className="text-sm tracking-widest">NO TRANSMISSIONS DETECTED</p>
            <p className="text-xs mt-2 text-[#222]">AWAITING FORGE SIGNAL...</p>
          </div>
        )}
      </div>
    </main>
  );
}
