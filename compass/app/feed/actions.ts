'use server';

// Server actions invoked by the feed UI.
//   saveItem      — bookmark an item to /saved
//   dismissItem   — hide this item from this user's future feeds
//   recordView    — fire-and-forget impression log (used by future ranking)
// All require auth — call requireUserId() before any DB write.

import { sql } from '@/lib/db';
import { requireUserId } from '@/lib/auth';

export async function saveItem(itemId: string) {
  try {
    const userId = await requireUserId();
    await sql`
      insert into saved_items (user_id, item_id) values (${userId}, ${itemId})
      on conflict (user_id, item_id) do nothing
    `;
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'save failed' };
  }
}

export async function dismissItem(itemId: string) {
  try {
    const userId = await requireUserId();
    await sql`
      insert into interactions (user_id, item_id, action)
      values (${userId}, ${itemId}, 'dismiss')
    `;
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'dismiss failed' };
  }
}

export async function recordView(itemId: string) {
  try {
    const userId = await requireUserId();
    await sql`
      insert into interactions (user_id, item_id, action)
      values (${userId}, ${itemId}, 'view')
    `;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
