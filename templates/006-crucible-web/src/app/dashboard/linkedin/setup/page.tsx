'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface CredentialsView {
  publoraApiKey: string | null;
  linkedinPlatformId: string | null;
  apifyToken: string | null;
  pixfaroToken: string | null;
  hasPublora: boolean;
  hasApify: boolean;
  hasPixfaro: boolean;
  verifiedAt: string | null;
}

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [companyName, setCompanyName] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [creds, setCreds] = useState<CredentialsView | null>(null);
  const [form, setForm] = useState({ publoraApiKey: '', linkedinPlatformId: '', apifyToken: '', pixfaroToken: '' });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const fetchCredentials = useCallback(async () => {
    if (!companyId) return;
    const res = await fetch(`/api/linkedin/credentials?companyId=${companyId}`);
    const data = await res.json();
    if (data.credentials) setCreds(data.credentials);
  }, [companyId]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCompany(true);
    try {
      const res = await fetch('/api/linkedin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName }),
      });
      const data = await res.json();
      if (res.ok && data.company) {
        router.push(`/dashboard/linkedin/setup?companyId=${data.company.id}`);
      } else {
        setTestResult({ ok: false, message: data.error ?? 'Failed to create company' });
      }
    } catch {
      setTestResult({ ok: false, message: 'Failed to create company' });
    }
    setCreatingCompany(false);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/linkedin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ publoraApiKey: '', linkedinPlatformId: '', apifyToken: '', pixfaroToken: '' });
        await fetchCredentials();
        setTestResult(null);
      } else {
        setTestResult({ ok: false, message: data.error });
      }
    } catch {
      setTestResult({ ok: false, message: 'Failed to save credentials' });
    }
    setSaving(false);
  };

  const handleTestConnection = async () => {
    if (!companyId) return;
    setTesting(true);
    try {
      const res = await fetch('/api/linkedin/credentials/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      setTestResult({
        ok: Boolean(data.ok),
        message: data.ok
          ? `Connected: ${data.matched?.username ?? data.matched?.platformId}`
          : data.error ?? 'No matching LinkedIn connection found on this Publora account',
      });
      await fetchCredentials();
    } catch {
      setTestResult({ ok: false, message: 'Test request failed' });
    }
    setTesting(false);
  };

  if (!companyId) {
    return (
      <form onSubmit={handleCreateCompany} className="max-w-md">
        <label className="font-mono text-xs uppercase tracking-widest text-[#888] block mb-2">Company name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. vakeels.ai"
          required
          className="w-full bg-[#111] border border-industrial-dark rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-molten mb-4"
        />
        <button
          type="submit"
          disabled={creatingCompany}
          className="px-6 py-3 bg-molten text-black font-mono text-xs font-bold uppercase rounded-lg hover:bg-molten-hover transition-colors disabled:opacity-50"
        >
          {creatingCompany ? 'Creating…' : 'Create company'}
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6 p-4 bg-[#0a0a0c] border border-industrial-dark rounded-lg font-mono text-xs text-[#888]">
        Each company connects its own Publora, Apify, and Pixfaro accounts — this product orchestrates
        them, it does not resell them. Publora is required; Apify and Pixfaro are optional (read/image features).
      </div>

      <form onSubmit={handleSaveCredentials} className="space-y-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#888] block mb-2">
            Publora API key {creds?.hasPublora && <span className="text-success">({creds.publoraApiKey})</span>}
          </label>
          <input
            type="password"
            value={form.publoraApiKey}
            onChange={(e) => setForm({ ...form, publoraApiKey: e.target.value })}
            placeholder={creds?.hasPublora ? 'Set — enter a new value to replace' : 'pub_...'}
            className="w-full bg-[#111] border border-industrial-dark rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-molten"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#888] block mb-2">
            LinkedIn platformId
          </label>
          <input
            type="text"
            value={form.linkedinPlatformId}
            onChange={(e) => setForm({ ...form, linkedinPlatformId: e.target.value })}
            placeholder={creds?.linkedinPlatformId ?? 'linkedin-xxxxxxxx (from Publora → Channels)'}
            className="w-full bg-[#111] border border-industrial-dark rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-molten"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#888] block mb-2">
            Apify token (optional) {creds?.hasApify && <span className="text-success">({creds.apifyToken})</span>}
          </label>
          <input
            type="password"
            value={form.apifyToken}
            onChange={(e) => setForm({ ...form, apifyToken: e.target.value })}
            placeholder={creds?.hasApify ? 'Set — enter a new value to replace' : 'apify_api_...'}
            className="w-full bg-[#111] border border-industrial-dark rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-molten"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#888] block mb-2">
            Pixfaro token (optional) {creds?.hasPixfaro && <span className="text-success">({creds.pixfaroToken})</span>}
          </label>
          <input
            type="password"
            value={form.pixfaroToken}
            onChange={(e) => setForm({ ...form, pixfaroToken: e.target.value })}
            placeholder={creds?.hasPixfaro ? 'Set — enter a new value to replace' : 'pf_live_...'}
            className="w-full bg-[#111] border border-industrial-dark rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-molten"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-molten text-black font-mono text-xs font-bold uppercase rounded-lg hover:bg-molten-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save credentials'}
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !creds?.hasPublora}
            className="px-6 py-3 bg-[#111] border border-industrial-dark text-[#888] font-mono text-xs font-bold uppercase rounded-lg hover:border-molten hover:text-molten transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {testing && <RefreshCw className="w-4 h-4 animate-spin" />}
            Test connection
          </button>
        </div>
      </form>

      {testResult && (
        <div
          className={`mt-4 p-3 rounded-lg font-mono text-xs flex items-center gap-2 ${
            testResult.ok ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}
        >
          {testResult.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {testResult.message}
        </div>
      )}

      <p className="mt-6 font-mono text-xs text-[#555]">
        Once Publora is connected and verified, continue to{' '}
        <a href={`/dashboard/linkedin/voice?companyId=${companyId}`} className="text-molten underline">
          Voice
        </a>{' '}
        and{' '}
        <a href={`/dashboard/linkedin/schedule?companyId=${companyId}`} className="text-molten underline">
          Schedule
        </a>
        .
      </p>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={null}>
      <SetupContent />
    </Suspense>
  );
}
