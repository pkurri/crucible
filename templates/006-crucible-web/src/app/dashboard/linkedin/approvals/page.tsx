'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Draft {
  id: string;
  skill_name: string;
  kind: string;
  preview_text: string;
  target_url: string | null;
  extra_context: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

function ApprovalsContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [acting, setActing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDrafts = useCallback(async () => {
    if (!companyId) return;
    const res = await fetch(`/api/linkedin/drafts?companyId=${companyId}&status=pending`);
    const data = await res.json();
    if (data.drafts) setDrafts(data.drafts);
  }, [companyId]);

  useEffect(() => {
    fetchDrafts();
    const interval = setInterval(fetchDrafts, 15000);
    return () => clearInterval(interval);
  }, [fetchDrafts]);

  const handleApprove = async (id: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/linkedin/drafts/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Published.');
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      } else {
        showToast(`Failed to publish: ${data.error}`);
      }
    } catch {
      showToast('Failed to publish');
    }
    setActing(null);
  };

  const handleReject = async (id: string) => {
    setActing(id);
    try {
      await fetch(`/api/linkedin/drafts/${id}/reject`, { method: 'POST' });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      showToast('Rejected.');
    } catch {
      showToast('Failed to reject');
    }
    setActing(null);
  };

  if (!companyId) {
    return <p className="font-mono text-sm text-[#666]">Pick a company from Overview first.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs text-[#888]">
          Nothing publishes without your approval here — this is the only path from a draft to a live post.
        </p>
        <button onClick={fetchDrafts} className="text-[#555] hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {drafts.map((d) => (
          <div key={d.id} className="bg-[#0a0a0c] border border-industrial-dark rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-molten">
                {d.skill_name} — {d.kind}
              </span>
              <span className="font-mono text-[10px] text-[#555]">{new Date(d.created_at).toLocaleString()}</span>
            </div>
            <div className="bg-[#050505] border border-[#111] rounded-lg p-4 font-mono text-xs text-white whitespace-pre-wrap leading-relaxed mb-3">
              {d.preview_text}
            </div>
            {d.target_url && (
              <p className="font-mono text-[10px] text-[#555] mb-3">Target: {d.target_url}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleApprove(d.id)}
                disabled={acting === d.id}
                className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success border border-success/30 rounded-lg font-mono text-xs font-bold uppercase hover:bg-success/20 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Approve & publish
              </button>
              <button
                onClick={() => handleReject(d.id)}
                disabled={acting === d.id}
                className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error border border-error/30 rounded-lg font-mono text-xs font-bold uppercase hover:bg-error/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
        {drafts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-industrial-dark rounded-xl">
            <p className="font-mono text-sm text-[#444]">No pending drafts.</p>
            <p className="font-mono text-[10px] text-[#333] mt-1">Run a skill from Overview to generate one.</p>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#111] border border-industrial-dark px-6 py-3 rounded-xl shadow-2xl font-mono text-sm text-white">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={null}>
      <ApprovalsContent />
    </Suspense>
  );
}
