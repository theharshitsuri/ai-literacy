'use server';

// Admin-only server action: add a new item.
// Re-checks the admin allowlist on every call — never trust the client side.
import { sql } from '@/lib/db';
import { requireUserId } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type { Level, JobId } from '@/lib/types';

async function assertAdmin() {
  await requireUserId();
  const u = await currentUser();
  const email = u?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
  const allow = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  if (!allow.includes(email)) throw new Error('Not authorized');
}

export async function addItem(input: {
  source: string;
  source_url: string;
  title: string;
  blurb: string;
  type: 'news' | 'tool' | 'prompt' | 'howto';
  level_min: Level;
  level_max: Level;
  jobs: JobId[] | ['all'];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await assertAdmin();
    await sql`
      insert into items (source, source_url, title, blurb, type, level_min, level_max, jobs, status, published_at, approved_at)
      values (
        ${input.source}, ${input.source_url}, ${input.title}, ${input.blurb}, ${input.type},
        ${input.level_min}, ${input.level_max}, ${input.jobs as any},
        'live', now(), now()
      )
      on conflict (source_url) do update set
        title = excluded.title,
        blurb = excluded.blurb,
        type  = excluded.type,
        level_min = excluded.level_min,
        level_max = excluded.level_max,
        jobs  = excluded.jobs,
        status = 'live',
        approved_at = now()
    `;
    revalidatePath('/admin/items');
    revalidatePath('/feed');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'add failed' };
  }
}
