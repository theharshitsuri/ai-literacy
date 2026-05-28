'use client';

// Inline form to add a single feed item. Calls the server action below.
import { useState, useTransition } from 'react';
import { addItem } from './actions';
import { JOBS } from '@/lib/profiling';
import type { Level, JobId } from '@/lib/types';

const LEVELS: Level[] = ['newcomer', 'curious', 'user', 'ready'];
const TYPES: Array<'news'|'tool'|'prompt'|'howto'> = ['news', 'tool', 'prompt', 'howto'];

export function AddItemForm() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [jobIds, setJobIds] = useState<JobId[]>(['all' as any]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addItem({
        source: String(fd.get('source')),
        source_url: String(fd.get('source_url')),
        title: String(fd.get('title')),
        blurb: String(fd.get('blurb')),
        type: fd.get('type') as any,
        level_min: fd.get('level_min') as Level,
        level_max: fd.get('level_max') as Level,
        jobs: jobIds.length ? jobIds : ['all' as any],
      });
      if (r.ok) {
        setMsg({ ok: true, text: '✓ Added' });
        (e.target as HTMLFormElement).reset();
      } else {
        setMsg({ ok: false, text: r.error || 'failed' });
      }
    });
  };

  const toggleJob = (j: JobId) => {
    setJobIds(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev.filter(x => x !== ('all' as any)), j]);
  };

  return (
    <form onSubmit={onSubmit} className="p-6 border border-line rounded-xl bg-paper grid md:grid-cols-2 gap-4">
      <Field label="Source label" name="source" placeholder="manual / reddit / hn / rss-openai" required />
      <Field label="Source URL" name="source_url" placeholder="https://…" required />
      <Field label="Title" name="title" placeholder="What the link is about" required className="md:col-span-2" />
      <Field label="Blurb (2–3 lines)" name="blurb" textarea placeholder="What the reader gets from clicking through." required className="md:col-span-2" />

      <Select label="Type" name="type" options={TYPES} />
      <Select label="Level min" name="level_min" options={LEVELS} defaultValue="newcomer" />
      <Select label="Level max" name="level_max" options={LEVELS} defaultValue="ready" />

      <div className="md:col-span-2">
        <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-muted mb-2">Jobs</label>
        <div className="flex flex-wrap gap-2">
          {([{ id: 'all', label: 'all jobs' } as any, ...JOBS]).map((j: any) => {
            const on = jobIds.includes(j.id);
            return (
              <button key={j.id} type="button" onClick={() => toggleJob(j.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] border ${on ? 'border-accent bg-accent text-paper' : 'border-line text-ink-2 bg-paper-2'}`}>
                {j.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-2 flex items-center gap-4 mt-2">
        <button type="submit" disabled={pending}
          className="px-5 py-3 bg-ink text-paper rounded-lg font-semibold text-[14px] disabled:bg-line disabled:text-muted hover:bg-accent">
          {pending ? 'saving…' : 'Add item'}
        </button>
        {msg && (
          <span className={`font-mono text-[12px] ${msg.ok ? 'text-ok' : 'text-accent'}`}>{msg.text}</span>
        )}
      </div>
    </form>
  );
}

function Field({ label, name, placeholder, required, textarea, className }: { label: string; name: string; placeholder?: string; required?: boolean; textarea?: boolean; className?: string }) {
  return (
    <label className={`block ${className || ''}`}>
      <span className="block font-mono text-[11px] tracking-[0.1em] uppercase text-muted mb-1.5">{label}{required && ' *'}</span>
      {textarea ? (
        <textarea name={name} placeholder={placeholder} required={required} rows={3}
          className="w-full px-3 py-2.5 border border-line rounded-md bg-paper text-ink text-[14px] focus:border-ink outline-none" />
      ) : (
        <input name={name} placeholder={placeholder} required={required}
          className="w-full px-3 py-2.5 border border-line rounded-md bg-paper text-ink text-[14px] focus:border-ink outline-none" />
      )}
    </label>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: string[]; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] tracking-[0.1em] uppercase text-muted mb-1.5">{label}</span>
      <select name={name} defaultValue={defaultValue ?? options[0]}
        className="w-full px-3 py-2.5 border border-line rounded-md bg-paper text-ink text-[14px] focus:border-ink outline-none">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
