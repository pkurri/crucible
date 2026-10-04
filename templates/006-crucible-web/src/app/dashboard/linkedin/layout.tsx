'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const TABS = [
  { href: '/dashboard/linkedin', label: 'Overview' },
  { href: '/dashboard/linkedin/setup', label: 'Setup' },
  { href: '/dashboard/linkedin/voice', label: 'Voice' },
  { href: '/dashboard/linkedin/schedule', label: 'Schedule' },
  { href: '/dashboard/linkedin/approvals', label: 'Approvals' },
];

function LinkedinNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const qs = companyId ? `?companyId=${companyId}` : '';

  return (
    <nav className="flex items-center gap-1 border-b border-industrial-dark mb-8 overflow-x-auto">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={`${tab.href}${qs}`}
          className={`px-4 py-3 font-mono text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
            pathname === tab.href
              ? 'border-molten text-molten'
              : 'border-transparent text-[#666] hover:text-white'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default function LinkedinDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-24 pb-24 bg-obsidian-dark">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-6">
          <span className="font-mono text-molten tracking-[0.3em] text-xs uppercase">LinkedIn Growth</span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mt-1">Automation</h1>
        </div>
        <Suspense fallback={null}>
          <LinkedinNav />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
