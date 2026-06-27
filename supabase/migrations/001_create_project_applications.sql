create extension if not exists pgcrypto;

create table if not exists public.project_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  whatsapp text not null,
  city text not null,
  company_name text not null,
  instagram text not null,
  website text not null,
  segment text not null,
  business_stage text not null,
  main_challenge text not null,
  desired_transformation text not null,
  project_need text not null,
  investment_range text not null,
  start_timeline text not null,
  message text not null,
  source text not null
);

alter table public.project_applications enable row level security;

create policy "Project applications are insertable by service role only"
  on public.project_applications
  for all
  using (false)
  with check (false);
