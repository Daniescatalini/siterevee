create extension if not exists pgcrypto;

create table if not exists public.project_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  whatsapp text not null,
  city text not null,
  company_name text not null,
  instagram text,
  website text,
  segment text,
  instagram_website text,
  business_stage text not null,
  main_challenge text,
  main_challenges text not null,
  services_needed text not null,
  desired_transformation text not null,
  project_need text,
  investment_range text not null,
  start_timeline text not null,
  message text,
  source text not null
);

alter table public.project_applications enable row level security;

create policy "Project applications are insertable by service role only"
  on public.project_applications
  for all
  using (false)
  with check (false);
