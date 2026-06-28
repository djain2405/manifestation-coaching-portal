-- Manifest Portal — initial schema

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

-- Invites
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  email text,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users (id),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Site settings (single row keyed by id)
create table public.site_settings (
  id text primary key default 'default',
  title text not null default 'Manifest Portal',
  tagline text not null default '',
  password_hint text not null default '',
  theme text default 'light',
  labels jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Collections (series)
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  accent text default '#163832',
  cover_gradient text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Items (lessons / steps)
create table public.items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete cascade,
  slug text not null,
  type text not null check (type in ('watch', 'activity')),
  title text not null,
  subtitle text,
  emoji text,
  description text not null default '',
  highlight text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, slug)
);

-- Watch item details
create table public.watch_items (
  item_id uuid primary key references public.items (id) on delete cascade,
  embed_provider text not null check (embed_provider in ('youtube', 'vimeo', 'loom')),
  embed_id text not null,
  duration_minutes int
);

-- Activity item details
create table public.activity_items (
  item_id uuid primary key references public.items (id) on delete cascade,
  intro text,
  pdf_path text,
  pdf_label text,
  estimated_minutes int
);

-- Activity prompts
create table public.activity_prompts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  prompt_key text not null,
  label text not null,
  kind text not null check (kind in ('shorttext', 'longtext', 'checkbox')),
  placeholder text,
  sort_order int not null default 0,
  unique (item_id, prompt_key)
);

-- User progress per item
create table public.user_item_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  completed_at timestamptz,
  last_opened_at timestamptz,
  primary key (user_id, item_id)
);

-- Activity responses (notes)
create table public.activity_responses (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  prompt_key text not null,
  value text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id, prompt_key)
);

-- Indexes
create index items_collection_sort_idx on public.items (collection_id, sort_order);
create index invites_token_idx on public.invites (token);
create index user_item_progress_user_idx on public.user_item_progress (user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'viewer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.site_settings enable row level security;
alter table public.collections enable row level security;
alter table public.items enable row level security;
alter table public.watch_items enable row level security;
alter table public.activity_items enable row level security;
alter table public.activity_prompts enable row level security;
alter table public.user_item_progress enable row level security;
alter table public.activity_responses enable row level security;

-- Profiles
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins read all profiles" on public.profiles
  for select using (public.is_admin());

-- Invites: admins manage; anyone can validate token via service role
create policy "Admins manage invites" on public.invites
  for all using (public.is_admin());

-- Site settings: public read, admin write
create policy "Anyone read site settings" on public.site_settings
  for select using (true);
create policy "Admins manage site settings" on public.site_settings
  for all using (public.is_admin());

-- Published content readable by authenticated users
create policy "Auth users read published collections" on public.collections
  for select using (auth.role() = 'authenticated' and (published or public.is_admin()));
create policy "Admins manage collections" on public.collections
  for all using (public.is_admin());

create policy "Auth users read items in published collections" on public.items
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.collections c
      where c.id = collection_id and (c.published or public.is_admin())
    )
  );
create policy "Admins manage items" on public.items
  for all using (public.is_admin());

create policy "Auth users read watch_items" on public.watch_items
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.items i
      join public.collections c on c.id = i.collection_id
      where i.id = item_id and (c.published or public.is_admin())
    )
  );
create policy "Admins manage watch_items" on public.watch_items
  for all using (public.is_admin());

create policy "Auth users read activity_items" on public.activity_items
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.items i
      join public.collections c on c.id = i.collection_id
      where i.id = item_id and (c.published or public.is_admin())
    )
  );
create policy "Admins manage activity_items" on public.activity_items
  for all using (public.is_admin());

create policy "Auth users read activity_prompts" on public.activity_prompts
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.items i
      join public.collections c on c.id = i.collection_id
      where i.id = item_id and (c.published or public.is_admin())
    )
  );
create policy "Admins manage activity_prompts" on public.activity_prompts
  for all using (public.is_admin());

-- User progress: own rows only
create policy "Users manage own progress" on public.user_item_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own responses" on public.activity_responses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for worksheets (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('worksheets', 'worksheets', true);
