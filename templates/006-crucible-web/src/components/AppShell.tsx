'use client';

import { useState } from 'react';
import { ForgeRail } from './ForgeRail';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <ForgeRail collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className="min-h-screen transition-all duration-300"
        style={{ paddingLeft: collapsed ? '64px' : '220px' }}
      >
        {children}
      </div>
    </>
  );
}
