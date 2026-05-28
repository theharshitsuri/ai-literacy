// POST /api/click?id=<item-id> — fire-and-forget click logger.
// Called by FeedCardClient when a user opens a feed item. Returns 200
// even on failure so the user's navigation isn't blocked.
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { currentUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get('id');
    if (!itemId) return NextResponse.json({ ok: false }, { status: 400 });
    const userId = await currentUserId();
    if (!userId) return NextResponse.json({ ok: true, skipped: 'no auth' });
    await sql`
      insert into interactions (user_id, item_id, action)
      values (${userId}, ${itemId}, 'click')
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
