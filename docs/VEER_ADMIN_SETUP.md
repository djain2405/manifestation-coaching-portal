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
2. In **Lock to email**, enter Veer’s email (recommended so only he can use the link)
3. Set expiry (e.g. 30 days) → **Create invite**
4. Copy the invite link and send it to Veer (email or Slack)

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

- Use the **same email** Divya used for the invite (if the link was locked to your email)
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
| **Invites** | Admin → Invites | Create signup links for new learners |
| **Settings** | Admin → Settings | Portal title, tagline, labels |

**Learner view:** Click the site title or a module name to browse content as students see it.

### 5. Day-to-day login

Bookmark:

https://manifestation-coaching-portal.vercel.app/login

Use your email + password. No invite needed after the first signup.

### 6. Adding videos

1. Admin → **Series** → open a module
2. Edit a watch item or add a new one
3. Paste a **YouTube** link (or Loom URL) — the embed is created automatically

### 7. Adding worksheet PDFs

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

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Invalid or expired invite” | Ask Divya for a new invite from Admin → Invites |
| “Invite is for a different email” | Sign up with the email the invite was locked to |
| No **Admin** link after login | Sign out/in; confirm your email is in `ADMIN_EMAIL` on Vercel |
| Forgot password | Supabase must have email reset configured; contact Divya for a reset from Supabase Auth → Users |
