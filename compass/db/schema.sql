-- =====================================================================
-- COMPASS — database schema (Neon Postgres + Clerk auth)
-- =====================================================================
-- Auth lives in Clerk — user identity is a string (e.g. user_2abc123).
-- This schema stores app data only; user-scoping is enforced in the
-- application layer (server actions check Clerk's userId before any query).
--
-- Run this in the Neon SQL Editor on a fresh project, or via psql:
--   psql $DATABASE_URL -f db/schema.sql
-- =====================================================================

-- ─── profiles ─────────────────────────────────────────────────────
-- One row per signed-up user. The CAT result (theta + level) + their
-- job + free-text goal live here. user_id is Clerk's user_xxx string.
create table if not exists public.profiles (
  user_id      text primary key,        -- Clerk user id
  email        text not null,
  job_id       text,
  job_other    text,
  level        text check (level in ('newcomer','curious','user','ready')),
  theta        numeric,
  goal_text    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── items ────────────────────────────────────────────────────────
-- The content database. Each row is a curated feed item.
-- Status flow: pending (just ingested) → live (you approved) → rejected.
-- jobs[] = either ['all'] or a subset of job_ids.
create table if not exists public.items (
  id             uuid primary key default gen_random_uuid(),
  source         text not null,           -- 'reddit', 'rss-anthropic', 'hn', 'manual', etc.
  source_url     text not null,
  title          text not null,
  blurb          text,                    -- 2–3 line summary
  type           text not null check (type in ('news','tool','prompt','howto')),
  level_min      text not null default 'newcomer',
  level_max      text not null default 'ready',
  jobs           text[] not null default array['all']::text[],
  status         text not null default 'pending' check (status in ('pending','live','rejected')),
  published_at   timestamptz,
  approved_at    timestamptz,
  approved_by    text,                    -- Clerk user id of admin who approved
  created_at     timestamptz not null default now()
);

create index if not exists items_status_idx    on public.items(status);
create index if not exists items_type_idx      on public.items(type);
create index if not exists items_published_idx on public.items(published_at desc);
create unique index if not exists items_url_uidx on public.items(source_url);

-- ─── captions ─────────────────────────────────────────────────────
-- Cached LLM-generated "why this matters to you" captions, keyed by
-- (item, level, job). One row per cell, generated once, served forever.
create table if not exists public.captions (
  item_id        uuid not null references public.items(id) on delete cascade,
  level          text not null,
  job_id         text not null,
  caption        text not null,
  generated_at   timestamptz not null default now(),
  model          text not null default 'gpt-4o-mini',
  primary key (item_id, level, job_id)
);

create index if not exists captions_item_idx on public.captions(item_id);

-- ─── saved_items ──────────────────────────────────────────────────
create table if not exists public.saved_items (
  user_id    text not null,                -- Clerk user id
  item_id    uuid not null references public.items(id) on delete cascade,
  saved_at   timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index if not exists saved_items_user_idx on public.saved_items(user_id, saved_at desc);

-- ─── interactions ─────────────────────────────────────────────────
-- Behavior log — what users do with feed items.
create table if not exists public.interactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,               -- Clerk user id
  item_id     uuid not null references public.items(id) on delete cascade,
  action      text not null check (action in ('view','click','dismiss','more_like','less_like')),
  created_at  timestamptz not null default now()
);

create index if not exists interactions_user_idx on public.interactions(user_id, created_at desc);
create index if not exists interactions_item_idx on public.interactions(item_id);

-- ─── subscriptions ────────────────────────────────────────────────
create table if not exists public.subscriptions (
  user_id                text primary key, -- Clerk user id
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text not null default 'free' check (status in ('free','active','past_due','cancelled')),
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ─── update timestamps trigger ────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_touch      on public.profiles;
drop trigger if exists subscriptions_touch on public.subscriptions;

create trigger profiles_touch      before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- NOTE ON SECURITY:
-- =====================================================================
-- Neon doesn't run Postgres Row-Level Security at the auth layer — Clerk
-- handles auth separately. We enforce user-scoping in the application:
-- every server action / route handler calls requireUserId() from
-- lib/auth.ts and includes `WHERE user_id = $clerkUserId` in its query.
-- Never expose a raw query interface to the client.
