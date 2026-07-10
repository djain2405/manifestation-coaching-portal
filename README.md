# Manifest Portal

> Repo name: `manifestation-coaching-portal`

A private learning portal: invite-only signup, video lessons (YouTube / Loom), worksheets with saved notes, and an admin CMS.

## Quick start

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in the SQL editor
3. Create a public Storage bucket named `worksheets`
4. Copy API keys to `.env.local` (see [`.env.example`](.env.example))

### 2. Environment

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Set ADMIN_EMAIL (comma-separated for multiple admins) for admin access on signup/login
# Optional: LOOM_API_KEY for admin Loom video picker
```

### 3. Seed content

```bash
nvm use 20
npm install
npm run seed
```

The seed script prints a **bootstrap invite link** — use it to create your admin account.

### 4. Run

```bash
npm run dev
```

- Learner site: http://127.0.0.1:3000/login  
- Admin: http://127.0.0.1:3000/admin (after signing in as admin)

## Features

| Feature | Description |
|---------|-------------|
| **Invite signup** | `/signup?invite=token` — email-locked invite + password |
| **Progress** | Saved per user in Supabase (syncs across devices) |
| **Worksheets** | Type notes in-browser or download PDF |
| **Admin** | Reorder lessons (drag-and-drop), add Loom/YouTube videos, invites |
| **Loom** | Browse workspace videos in admin when `LOOM_API_KEY` is set |

## Legacy mode

Without Supabase env vars, the app falls back to shared portal password + `content/curriculum.json` + localStorage progress.

## Deploy

```bash
npx vercel
```

Set all env vars in the Vercel dashboard. Run the migration SQL on your Supabase project.

For onboarding a second admin (e.g. Veer), see [`docs/VEER_ADMIN_SETUP.md`](docs/VEER_ADMIN_SETUP.md).
