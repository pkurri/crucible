'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase, Transmission } from '@/lib/supabase';
import { IntelCard } from './IntelCard';

export function IntelFeed({ initial }: { initial: Transmission[] }) {
  const [transmissions, setTransmissions] = useState<Transmission[]>(initial);

  useEffect(() => {
    const channel = supabase
      .channel('transmissions-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transmissions' },
        (payload) => {
          setTransmissions((prev) => [payload.new as Transmission, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnimatePresence>
        {transmissions.map((t, i) => (
          <IntelCard key={t.id} transmission={t} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}
