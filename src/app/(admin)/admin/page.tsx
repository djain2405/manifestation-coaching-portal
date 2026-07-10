import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getAllCollectionsForAdmin } from "@/lib/curriculum";
import { countMembers } from "@/lib/members";

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  const collections = await getAllCollectionsForAdmin();
  const memberCount = await countMembers();

  const { count: inviteCount } = await supabase
    .from("invites")
    .select("*", { count: "exact", head: true })
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString());

  // Prefer excluding revoked when the column exists (post-migration).
  const { count: openInviteCount, error: openInviteError } = await supabase
    .from("invites")
    .select("*", { count: "exact", head: true })
    .is("used_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString());

  const openInvites = openInviteError ? inviteCount : openInviteCount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Admin</h1>
        <p className="text-muted">Manage your Manifest Portal content and invites.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm text-muted">Members</p>
          <p className="font-display text-3xl text-foreground">{memberCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm text-muted">Series</p>
          <p className="font-display text-3xl text-foreground">{collections.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm text-muted">Open invites</p>
          <p className="font-display text-3xl text-foreground">{openInvites ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm text-muted">Lessons total</p>
          <p className="font-display text-3xl text-foreground">
            {collections.reduce((n, c) => n + c.items.length, 0)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/series"
          className="min-h-12 rounded-lg bg-accent px-6 py-3 text-base font-semibold text-accent-foreground"
        >
          Manage series
        </Link>
        <Link
          href="/admin/members"
          className="min-h-12 rounded-lg border border-border bg-white px-6 py-3 text-base font-medium"
        >
          Members
        </Link>
        <Link
          href="/admin/invites"
          className="min-h-12 rounded-lg border border-border bg-white px-6 py-3 text-base font-medium"
        >
          Invites
        </Link>
        <Link
          href="/admin/settings"
          className="min-h-12 rounded-lg border border-border bg-white px-6 py-3 text-base font-medium"
        >
          Site settings
        </Link>
        <Link
          href="/"
          className="min-h-12 rounded-lg border border-border px-6 py-3 text-base text-muted"
        >
          View site
        </Link>
      </div>
    </div>
  );
}
