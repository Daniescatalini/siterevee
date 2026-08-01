create table if not exists public.journal_likes (
  slug text primary key,
  likes_count integer not null default 0 check (likes_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.journal_likes enable row level security;

create or replace function public.increment_journal_like(article_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  insert into public.journal_likes as likes (slug, likes_count, updated_at)
  values (article_slug, 1, now())
  on conflict (slug)
  do update set
    likes_count = likes.likes_count + 1,
    updated_at = now()
  returning likes_count into next_count;

  return next_count;
end;
$$;
