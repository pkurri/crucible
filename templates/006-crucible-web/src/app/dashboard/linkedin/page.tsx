'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, RefreshCw, Plus } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  plan_tier: string;
  status: string;
  created_at: string;
}

interface JobRun {
  id: string;
  skill_name: string;
  job_type: string | null;
  status: string;
  started_at: string;
  finished_at: string | null;
  cost_usd: number | null;
  error_message: string | null;
}

const JOB_TYPES = ['weekly_content_batch', 'daily_comment_check', 'thread_monitor'] as const;

function OverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [runs, setRuns] = useState<JobRun[]>([]);
  const [runningJobType, setRunningJobType] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCompanies = useCallback(async () => {
    const res = await fetch('/api/linkedin/companies');
    const data = await res.json();
    if (data.companies) {
      setCompanies(data.companies);
      if (!companyId && data.companies.length > 0) {
        router.replace(`/dashboard/linkedin?companyId=${data.companies[0].id}`);
      }
    }
  }, [companyId, router]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // No direct DB access from the client for skill_job_runs (RLS-scoped, but
  // simplest to route through the same admin-backed pattern as everything
  // else here) — reuse the drafts-style GET convention via a small inline fetch.
  useEffect(() => {
    if (!companyId) return;
    (async () => {
      const res = await fetch(`/api/linkedin/drafts?companyId=${companyId}&status=all`);
      const data = await res.json();
      // Recent drafts double as a lightweight activity feed until a
      // dedicated job-runs endpoint is worth adding.
      if (data.drafts) {
        setRuns(
          data.drafts.map((d: any) => ({
            id: d.id,
            skill_name: d.skill_name,
            job_type: d.extra_context?.jobType ?? null,
            status: d.status,
            started_at: d.created_at,
            finished_at: d.reviewed_at,
            cost_usd: null,
            error_message: d.error_message,
          }))
        );
      }
    })();
  }, [companyId]);

  const handleRunNow = async (jobType: string) => {
    if (!companyId) return;
    setRunningJobType(jobType);
    try {
      const res = await fetch('/api/linkedin/run-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, jobType }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Job queued (${jobType}) — check Approvals shortly once it drafts something`);
      } else {
        showToast(`Failed: ${data.error}`);
      }
    } catch {
      showToast('Failed to queue job');
    }
    setRunningJobType(null);
  };

  const selectedCompany = companies.find((c) => c.id === companyId);

  if (companies.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-industrial-dark rounded-xl">
        <p className="font-mono text-sm text-[#666] mb-4">No companies yet.</p>
        <a
          href="/dashboard/linkedin/setup"
          className="inline-flex items-center gap-2 px-5 py-3 bg-molten text-black font-mono text-xs font-bold uppercase rounded-lg hover:bg-molten-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> Create a company
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <select
          value={companyId ?? ''}
          onChange={(e) => router.push(`/dashboard/linkedin?companyId=${e.target.value}`)}
          className="bg-[#111] border border-industrial-dark rounded-lg px-4 py-2 font-mono text-sm text-white"
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.status})
            </option>
          ))}
        </select>
        <a href="/dashboard/linkedin/setup" className="font-mono text-xs text-[#666] hover:text-molten underline">
          + new company
        </a>
      </div>

      {selectedCompany && (
        <div className="bg-[#0a0a0c] border border-industrial-dark rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Status</span>
              <p className="font-mono text-white text-lg">{selectedCompany.status}</p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#555]">Plan</span>
              <p className="font-mono text-white text-lg">{selectedCompany.plan_tier}</p>
            </div>
          </div>
          {selectedCompany.status === 'pending_setup' && (
            <p className="mt-3 font-mono text-xs text-molten">
              Finish credential setup before running anything — see the Setup tab.
            </p>
          )}
        </div>
      )}

      <h2 className="font-mono text-xs uppercase tracking-widest text-[#888] mb-3">Run a skill now</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {JOB_TYPES.map((jt) => (
          <button
            key={jt}
            onClick={() => handleRunNow(jt)}
            disabled={runningJobType === jt || !companyId}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#111] border border-industrial-dark rounded-lg font-mono text-xs uppercase text-[#888] hover:border-molten hover:text-molten transition-colors disabled:opacity-50"
          >
            {runningJobType === jt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {jt.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <h2 className="font-mono text-xs uppercase tracking-widest text-[#888] mb-3">Recent activity</h2>
      <div className="space-y-2">
        {runs.map((r) => (
          <div key={r.id} className="bg-[#0a0a0c] border border-industrial-dark rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-white">{r.skill_name}</span>
              {r.job_type && <span className="font-mono text-[10px] text-[#555] ml-2">({r.job_type})</span>}
            </div>
            <span
              className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full ${
                r.status === 'published' || r.status === 'succeeded'
                  ? 'text-success bg-success/10'
                  : r.status === 'failed' || r.status === 'rejected'
                    ? 'text-error bg-error/10'
                    : 'text-molten bg-molten/10'
              }`}
            >
              {r.status}
            </span>
          </div>
        ))}
        {runs.length === 0 && <p className="font-mono text-xs text-[#444]">Nothing yet — run a skill above.</p>}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#111] border border-industrial-dark px-6 py-3 rounded-xl shadow-2xl font-mono text-sm text-white">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function LinkedinOverviewPage() {
  return (
    <Suspense fallback={null}>
      <OverviewContent />
    </Suspense>
  );
}
