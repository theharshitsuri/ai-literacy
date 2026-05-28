'use server';

// Server actions for the quiz flow.
//
// saveQuizResult — called from /quiz/complete after the user signs in.
//   Upserts a profiles row keyed on Clerk's userId. Idempotent — if the user
//   retakes the quiz, the row is updated, not duplicated.

import { sql } from '@/lib/db';
import { requireUserId } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { levelFromTheta } from '@/lib/cat-engine';
import type { ProfilingAnswers, QuizState, JobId, Level } from '@/lib/types';

export async function saveQuizResult(input: {
  profilingAnswers: ProfilingAnswers;
  finalTheta: number;
}): Promise<{ ok: true; level: Level } | { ok: false; error: string }> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: 'Not signed in.' };
  }

  // Pull primary email from Clerk
  const u = await currentUser();
  const email = u?.emailAddresses?.[0]?.emailAddress ?? '';

  const level = levelFromTheta(input.finalTheta);
  const job_id = (input.profilingAnswers.p1 ?? null) as JobId | null;
  const job_other = input.profilingAnswers.p1_other ?? null;
  const goal_text = input.profilingAnswers.p3 ?? null;

  try {
    await sql`
      insert into profiles (user_id, email, job_id, job_other, level, theta, goal_text)
      values (${userId}, ${email}, ${job_id}, ${job_other}, ${level}, ${input.finalTheta}, ${goal_text})
      on conflict (user_id) do update set
        email      = excluded.email,
        job_id     = excluded.job_id,
        job_other  = excluded.job_other,
        level      = excluded.level,
        theta      = excluded.theta,
        goal_text  = excluded.goal_text
    `;
    return { ok: true, level };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'DB write failed' };
  }
}
