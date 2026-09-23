-- Coach presence + first-run welcome

alter table public.site_settings
  add column if not exists coach_name text not null default '',
  add column if not exists welcome_message text not null default '',
  add column if not exists coach_photo_url text not null default '',
  add column if not exists contact_line text not null default '';

alter table public.profiles
  add column if not exists welcome_seen_at timestamptz;
