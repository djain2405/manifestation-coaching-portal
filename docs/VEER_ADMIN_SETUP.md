# Admin access for Veer — setup & onboarding

Portal URL: **https://manifestation-coaching-portal.vercel.app**

---

## Part 1 — Divya: add Veer as admin (one-time)

Veer’s signup email: **manifest.miracles.veer@gmail.com**

### Step A — Update environment variable (required)

`ADMIN_EMAIL` supports **multiple emails**, comma-separated.

1. **Vercel** → your project → **Settings** → **Environment Variables**
2. Edit **Production** `ADMIN_EMAIL` to:

   ```
   divyajain2405@gmail.com,manifest.miracles.veer@gmail.com
   ```

   (No spaces, or spaces are fine — the app trims them.)

3. **Redeploy** production (Deployments → ⋯ on latest → Redeploy), or push any commit.

4. Optionally update local `.env.local` the same way for consistency.

### Step B — Create an invite for Veer

1. Sign in as admin → **Admin** (top right) → **Invites**
2. Enter Veer’s email in **Client email** (required — only that address can join)
3. Set expiry (e.g. 30 days) → **Create invite**
4. Copy the invite link and send it only to Veer

### Step C — If Veer already signed up as a learner

Either:

- **Option 1:** Add his email to `ADMIN_EMAIL` (Step A), then ask him to **sign out and sign in again** — he’ll be promoted to admin automatically.

- **Option 2:** In Supabase → **SQL Editor**, run:

  ```sql
  update public.profiles
  set role = 'admin'
  where id = (
    select id from auth.users where lower(email) = lower('manifest.miracles.veer@gmail.com')
  );
  ```

---

## Part 2 — Veer: create your account & use admin

### 1. Accept your invite

Open the invite link Divya sent you. It looks like:

```
https://manifestation-coaching-portal.vercel.app/signup?invite=...
```

### 2. Sign up

- The form shows your email **locked** (you cannot change it)
- Choose a password (at least 8 characters)
- Confirm password must match

You’ll land on the portal home page after signup.

### 3. Confirm you’re an admin

- On the **home page** (list of modules), you should see **Admin** in the top right, next to **Sign out**
- Click **Admin** to open the dashboard

If you don’t see **Admin**, sign out and sign in again at:

https://manifestation-coaching-portal.vercel.app/login

If it still doesn’t appear, contact Divya — your email may not be on the admin list yet.

### 4. What you can do as admin

| Area | Path | Purpose |
|------|------|---------|
| **Series** | Admin → Series | Edit modules, add videos & worksheets, upload PDFs |
| **Members** | Admin → Members | See who has access; Suspend / Restore learners |
| **Invites** | Admin → Invites | Create email-locked signup links for new learners |
| **Settings** | Admin → Settings | Portal title, tagline, labels |

**Learner view:** Click the site title or a module name to browse content as students see it.

### Members — Suspend / Restore

1. Admin → **Members**
2. Find the learner → **Suspend** (confirm)
3. They cannot sign in until you click **Restore**
4. Progress and notes are kept while suspended

Rules:

- You cannot suspend your own account
- Admin accounts cannot be suspended from this screen
- Suspend does **not** stop password sharing while the account is still Active — use Suspend when you need to cut off access
- Revoke unused invites separately under **Invites**

### 5. Inviting learners (secure process)

Every invite **must** include the client’s email. Forwarding the link to someone else does **not** let them create an account with a different email.

1. Admin → **Invites**
2. Enter the **client’s exact email** (required)
3. Set how many days the link stays open (1–90)
4. **Create invite** → **Copy signup link**
5. Send that link only to that client

If a link leaks or you sent it to the wrong person:

- Click **Revoke** on that invite
- Create a new invite for the correct email

**Important:** This stops *other people from signing up with the forwarded link*. It does **not** stop a client from sharing their password after they join. If that happens, **Suspend** them under Admin → Members.

### 6. Day-to-day login

Bookmark:

https://manifestation-coaching-portal.vercel.app/login

Use your email + password. No invite needed after the first signup.

### 7. Adding videos

1. Admin → **Series** → open a module
2. Edit a watch item or add a new one
3. Paste a **YouTube** link (or Loom URL) — the embed is created automatically

### 8. Adding worksheet PDFs

1. Admin → **Series** → open the worksheet item → **Edit**
2. Upload a PDF (max 10 MB)
3. Learners can download it and save notes in the portal

---

## Quick reference

| Item | Value |
|------|--------|
| Live site | https://manifestation-coaching-portal.vercel.app |
| Login | https://manifestation-coaching-portal.vercel.app/login |
| Admin dashboard | https://manifestation-coaching-portal.vercel.app/admin |
| GitHub repo | https://github.com/djain2405/manifestation-coaching-portal |
| Database / auth | Supabase (Divya has dashboard access) |

---

## Database migration (one-time after deploy)

In Supabase → **SQL Editor**, run:

[`supabase/migrations/002_invite_revoke.sql`](../supabase/migrations/002_invite_revoke.sql)

```sql
alter table public.invites
  add column if not exists revoked_at timestamptz;
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Invalid, revoked, or expired invite” | Create a new email-locked invite; revoke the old one if needed |
| Legacy open invite (no email) | Those no longer work — recreate with the client’s email |
| No **Admin** link after login | Sign out/in; confirm your email is in `ADMIN_EMAIL` on Vercel |
| Forgot password | Supabase must have email reset configured; contact Divya for a reset from Supabase Auth → Users |
