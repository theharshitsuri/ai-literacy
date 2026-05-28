// GET /api/me — returns the signed-in user's profile, or null if not yet
// created. Polled by /feed's ProfileWaiting component after sign-up.
import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/feed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ ok: false, profile: null });
  try {
    const profile = await getCurrentProfile(userId);
    return NextResponse.json({ ok: true, profile });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
