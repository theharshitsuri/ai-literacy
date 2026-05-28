'use server';

import { sql } from '@/lib/db';
import { requireUserId } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

async function assertAdmin(): Promise<string> {
  const userId = await requireUserId();
  const u = await currentUser();
  const email = u?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
  const allow = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  if (!allow.includes(email)) throw new Error('Not authorized');
  return userId;
}

export async function approveItem(itemId: string) {
  try {
    const userId = await assertAdmin();
    await sql`
      update items set status = 'live', approved_at = now(), approved_by = ${userId}
      where id = ${itemId}
    `;
    revalidatePath('/admin/queue');
    revalidatePath('/feed');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'approve failed' };
  }
}

export async function rejectItem(itemId: string) {
  try {
    await assertAdmin();
    await sql`update items set status = 'rejected' where id = ${itemId}`;
    revalidatePath('/admin/queue');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'reject failed' };
  }
}
