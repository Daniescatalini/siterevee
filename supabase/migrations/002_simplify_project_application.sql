alter table public.project_applications
  add column if not exists instagram_website text,
  add column if not exists main_challenges text,
  add column if not exists services_needed text;

-- Legacy fields remain available for historical applications, but are no longer
-- required by the simplified form.
alter table public.project_applications
  alter column instagram drop not null,
  alter column website drop not null,
  alter column segment drop not null,
  alter column main_challenge drop not null,
  alter column project_need drop not null,
  alter column message drop not null;
