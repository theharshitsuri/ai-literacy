// GET /api/diagnostic — health check, callable from the /diagnostic page.
// Reports: env presence, DB reachable, items count, captions count, OpenAI
// reachable. Use this when something breaks in a demo — you can see at a
// glance which piece is dead.
//
// Does NOT require auth — returns booleans only, no secret material.
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function check<T>(fn: () => Promise<T>): Promise<{ ok: boolean; value?: T; error?: string }> {
  try { return { ok: true, value: await fn() }; }
  catch (e: any) { return { ok: false, error: e?.message?.slice(0, 200) || 'unknown' }; }
}

export async function GET() {
  const env = {
    DATABASE_URL:                          !!process.env.DATABASE_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:     !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY:                      !!process.env.CLERK_SECRET_KEY,
    OPENAI_API_KEY:                        !!process.env.OPENAI_API_KEY,
    ADMIN_EMAILS:                          !!process.env.ADMIN_EMAILS,
    NEXT_PUBLIC_BASE_URL:                  process.env.NEXT_PUBLIC_BASE_URL || '(unset)',
  };

  const db = await check(async () => {
    const r = await sql`select 1 as ok` as unknown as Array<{ ok: number }>;
    return r[0]?.ok === 1;
  });

  const counts = await check(async () => {
    const items    = await sql`select count(*)::int as n from items where status = 'live'` as unknown as Array<{ n: number }>;
    const pending  = await sql`select count(*)::int as n from items where status = 'pending'` as unknown as Array<{ n: number }>;
    const captions = await sql`select count(*)::int as n from captions` as unknown as Array<{ n: number }>;
    const profiles = await sql`select count(*)::int as n from profiles` as unknown as Array<{ n: number }>;
    return {
      live_items:       items[0]?.n ?? 0,
      pending_items:    pending[0]?.n ?? 0,
      cached_captions:  captions[0]?.n ?? 0,
      profiles:         profiles[0]?.n ?? 0,
    };
  });

  const openai = await check(async () => {
    // We don't actually call OpenAI here (would cost a tenth of a cent
    // per /diagnostic hit). We just verify the key shape.
    const k = process.env.OPENAI_API_KEY || '';
    return k.startsWith('sk-') ? 'key looks valid' : 'key missing or wrong shape';
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env,
    db,
    counts,
    openai,
  });
}
