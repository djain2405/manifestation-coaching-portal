-- Allow admins to revoke unused invites without deleting history
alter table public.invites
  add column if not exists revoked_at timestamptz;
