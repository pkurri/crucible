'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Schedule {
  id: string;
  job_type: string;
  cron_pattern: string;
  enabled: boolean;
}

const JOB_TYPES: Array<{ type: string; label: string; defaultCron: string; help: string }> = [
  { type: 'weekly_content_batch', label: 'Weekly content batch', defaultCron: '0 13 * * 1', help: 'e.g. "0 13 * * 1" = Mondays 9am ET' },
  { type: 'daily_comment_check', label: 'Daily comment check', defaultCron: '0 13 * * *', help: 'e.g. "0 13 * * *" = 9am ET daily' },
  { type: 'thread_monitor', label: 'Thread monitor', defaultCron: '0 17 * * *', help: 'e.g. "0 17 * * *" = 1pm ET daily' },
];

function ScheduleContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [schedules, setSchedules] = useState<Record<string, Schedule | undefined>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!companyId) return;
    const res = await fetch(`/api/linkedin/schedules?companyId=${companyId}`);
    const data = await res.json();
    if (data.schedules) {
      const byType: Record<string, Schedule> = {};
      for (const s of data.schedules) byType[s.job_type] = s;
      setSchedules(byType);
    }
  }, [companyId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSave = async (jobType: string, cronPattern: string, enabled: boolean) => {
    if (!companyId) return;
    setSaving(jobType);
    try {
      await fetch('/api/linkedin/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, jobType, cronPattern, enabled }),
      });
      await fetchSchedules();
    } finally {
      setSaving(null);
    }
  };

  if (!companyId) {
    return <p className="font-mono text-sm text-[#666]">Pick a company from Overview first.</p>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="font-mono text-xs text-[#888] mb-2">
        Changes take effect within 5 minutes (the worker reconciles schedules on an interval, no restart needed).
      </p>
      {JOB_TYPES.map(({ type, label, defaultCron, help }) => {
        const existing = schedules[type];
        return (
          <div key={type} className="bg-[#0a0a0c] border border-industrial-dark rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-sm text-white uppercase tracking-wide">{label}</h3>
              <label className="flex items-center gap-2 font-mono text-xs text-[#888] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={existing?.enabled ?? false}
                  onChange={(e) =>
                    handleSave(type, existing?.cron_pattern ?? defaultCron, e.target.checked)
                  }
                />
                Enabled
              </label>
            </div>
            <input
              type="text"
              defaultValue={existing?.cron_pattern ?? defaultCron}
              onBlur={(e) => handleSave(type, e.target.value, existing?.enabled ?? false)}
              className="w-full bg-[#111] border border-industrial-dark rounded-lg px-4 py-2 font-mono text-xs text-white outline-none focus:border-molten"
            />
            <p className="font-mono text-[10px] text-[#555] mt-2">{help}</p>
            {saving === type && <p className="font-mono text-[10px] text-molten mt-1">Saving…</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={null}>
      <ScheduleContent />
    </Suspense>
  );
}
