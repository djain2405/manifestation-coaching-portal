import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { CreateInviteForm } from "@/components/admin/CreateInviteForm";
import { CopyInviteLink } from "@/components/admin/CopyInviteLink";

export default async function AdminInvitesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: invites } = await supabase
    .from("invites")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Invites</h1>
          <p className="text-muted">Create links for new learners to sign up.</p>
        </div>
        <Link href="/admin" className="text-accent underline">
          ← Admin
        </Link>
      </div>

      <CreateInviteForm />

      <ul className="space-y-3">
        {(invites ?? []).map((inv) => (
          <li
            key={inv.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4"
          >
            <div>
              <p className="font-mono text-sm">{inv.token.slice(0, 12)}…</p>
              <p className="text-sm text-muted">
                Expires {new Date(inv.expires_at).toLocaleDateString()}
                {inv.used_at ? " · Used" : " · Open"}
                {inv.email ? ` · ${inv.email}` : ""}
              </p>
            </div>
            {!inv.used_at ? <CopyInviteLink token={inv.token} /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
