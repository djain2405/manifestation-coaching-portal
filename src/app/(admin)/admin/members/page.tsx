import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { listMembers } from "@/lib/members";
import { MemberAccessButtons } from "@/components/admin/MemberAccessButtons";

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminMembersPage() {
  await requireAdmin();
  const members = await listMembers();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Members</h1>
          <p className="text-muted">
            Who has portal access. {members.length} member
            {members.length === 1 ? "" : "s"}. Suspend a learner to cut off
            login; Restore brings them back. Progress is kept.
          </p>
        </div>
        <Link href="/admin" className="text-accent underline">
          ← Admin
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <p className="text-muted">No members yet — create an invite.</p>
          <Link
            href="/admin/invites"
            className="mt-4 inline-block text-accent underline"
          >
            Go to Invites
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-white p-4 sm:p-5"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{member.fullName}</p>
                  <span
                    className={
                      member.role === "admin"
                        ? "rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                        : "rounded-md border border-border bg-surface/80 px-2 py-0.5 text-xs font-medium text-muted"
                    }
                  >
                    {member.role}
                  </span>
                  <span
                    className={
                      member.status === "suspended"
                        ? "rounded-md border border-red-300/60 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                        : "rounded-md border border-green-600/30 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                    }
                  >
                    {member.status === "suspended" ? "Suspended" : "Active"}
                  </span>
                </div>
                <p className="truncate text-sm text-muted">{member.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted">Joined</p>
                  <p className="text-foreground">{formatDate(member.joinedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Last sign-in</p>
                  <p className="text-foreground">
                    {formatDate(member.lastSignInAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Progress</p>
                  <p className="text-foreground">
                    {member.completedCount} completed
                  </p>
                  {member.lastActiveAt ? (
                    <p className="text-xs text-muted">
                      Active {formatDate(member.lastActiveAt)}
                    </p>
                  ) : null}
                </div>
              </div>

              <MemberAccessButtons
                memberId={member.id}
                memberName={member.fullName}
                status={member.status}
                canManage={member.role !== "admin"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
