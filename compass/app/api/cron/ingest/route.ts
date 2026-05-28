// /api/cron/ingest — Vercel cron handler. Runs the ingest pipeline once
// per invocation. Protected by CRON_SECRET in the Authorization header
// (Vercel cron jobs set this automatically; manual calls must include it).

import { NextResponse } from 'next/server';
import { runIngest } from '@/lib/sources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // give it up to a minute on Vercel

export async function GET(req: Request) {
  // Validate CRON_SECRET — Vercel adds Authorization: Bearer <secret>
  const auth = req.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const stats = await runIngest();
    return NextResponse.json({ ok: true, ...stats });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'ingest failed' }, { status: 500 });
  }
}
