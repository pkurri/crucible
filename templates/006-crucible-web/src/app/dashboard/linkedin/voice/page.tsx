'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface VoiceForm {
  voiceFingerprint: string;
  icp: string;
  hardRules: string;
  ctaStyle: string;
  brandHandle: string;
  brandColor: string;
  brandLogoUrl: string;
}

const EMPTY: VoiceForm = {
  voiceFingerprint: '',
  icp: '',
  hardRules: '',
  ctaStyle: '',
  brandHandle: '',
  brandColor: '',
  brandLogoUrl: '',
};

function VoiceContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [form, setForm] = useState<VoiceForm>(EMPTY);
  const [filled, setFilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!companyId) return;
    const res = await fetch(`/api/linkedin/voice-profile?companyId=${companyId}`);
    const data = await res.json();
    if (data.profile) {
      setFilled(Boolean(data.profile.filled));
      setForm({
        voiceFingerprint: data.profile.voice_fingerprint ?? '',
        icp: data.profile.icp ?? '',
        hardRules: data.profile.hard_rules ?? '',
        ctaStyle: data.profile.cta_style ?? '',
        brandHandle: data.profile.brand_handle ?? '',
        brandColor: data.profile.brand_color ?? '',
        brandLogoUrl: data.profile.brand_logo_url ?? '',
      });
    }
  }, [companyId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/linkedin/voice-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...form }),
      });
      setFilled(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!companyId) {
    return <p className="font-mono text-sm text-[#666]">Pick a company from Overview first.</p>;
  }

  const field = (
    key: keyof VoiceForm,
    label: string,
    placeholder: string,
    textarea = false
  ) => (
    <div>
      <label className="font-mono text-xs uppercase tracking-widest text-[#888] block mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-[#111] border border-industrial-dark rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-molten"
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-[#111] border border-industrial-dark rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-molten"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-lg">
      <div className="mb-6 p-4 bg-[#0a0a0c] border border-industrial-dark rounded-lg font-mono text-xs text-[#888]">
        Status: <span className={filled ? 'text-success' : 'text-molten'}>{filled ? 'filled' : 'not filled — skills use generic voice rules until this is saved'}</span>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {field('voiceFingerprint', 'Voice fingerprint', 'Tone, sentence rhythm, vocabulary quirks…', true)}
        {field('icp', 'ICP / audience', 'Who this content is for…', true)}
        {field('hardRules', 'Hard rules', 'Banned words/phrases, compliance constraints…', true)}
        {field('ctaStyle', 'CTA style', 'e.g. "always end with a question, never a comment-gate"')}
        {field('brandHandle', 'Brand handle', '@yourhandle')}
        {field('brandColor', 'Brand color', '#0A66C2')}
        {field('brandLogoUrl', 'Brand logo URL', 'https://…')}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-molten text-black font-mono text-xs font-bold uppercase rounded-lg hover:bg-molten-hover transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save voice profile'}
        </button>
        {saved && <span className="ml-4 font-mono text-xs text-success">Saved</span>}
      </form>
    </div>
  );
}

export default function VoicePage() {
  return (
    <Suspense fallback={null}>
      <VoiceContent />
    </Suspense>
  );
}
