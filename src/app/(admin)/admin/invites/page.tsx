import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { CreateInviteForm } from "@/components/admin/CreateInviteForm";
import { CopyInviteLink } from "@/components/admin/CopyInviteLink";
import { RevokeInviteButton } from "@/components/admin/RevokeInviteButton";

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
          <p className="text-muted">
            Create email-locked signup links for new learners. Only that email
            can join.
          </p>
        </div>
        <Link href="/admin" className="text-accent underline">
          ← Admin
        </Link>
      </div>

      <CreateInviteForm />

      <ul className="space-y-3">
        {(invites ?? []).map((inv) => {
          const revoked = Boolean(inv.revoked_at);
          const used = Boolean(inv.used_at);
          const expired =
            !used && !revoked && new Date(inv.expires_at).getTime() <= Date.now();
          const open = !used && !revoked && !expired;

          let status = "Open";
          if (used) status = "Used";
          else if (revoked) status = "Revoked";
          else if (expired) status = "Expired";

          return (
            <li
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4"
            >
              <div>
                <p className="font-medium text-foreground">
                  {inv.email ?? "No email (legacy — recreate)"}
                </p>
                <p className="font-mono text-xs text-muted">
                  {inv.token.slice(0, 12)}…
                </p>
                <p className="text-sm text-muted">
                  Expires {new Date(inv.expires_at).toLocaleDateString()} ·{" "}
                  {status}
                </p>
              </div>
              {open ? (
                <div className="flex flex-wrap items-center gap-2">
                  <CopyInviteLink token={inv.token} />
                  <RevokeInviteButton inviteId={inv.id} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
