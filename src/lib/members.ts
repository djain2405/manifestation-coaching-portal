import { createAdminClient } from "@/lib/supabase/admin";

export type MemberStatus = "active" | "suspended";

export type MemberRow = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "viewer";
  status: MemberStatus;
  joinedAt: string;
  lastSignInAt: string | null;
  completedCount: number;
  lastActiveAt: string | null;
};

function isSuspended(bannedUntil: string | undefined): boolean {
  if (!bannedUntil) return false;
  const until = new Date(bannedUntil).getTime();
  return Number.isFinite(until) && until > Date.now();
}

type ProgressAgg = {
  completedCount: number;
  lastActiveAt: string | null;
};

function displayName(
  profileName: string | null,
  metaName: unknown,
  email: string,
): string {
  if (profileName?.trim()) return profileName.trim();
  if (typeof metaName === "string" && metaName.trim()) return metaName.trim();
  const local = email.split("@")[0];
  return local || "Member";
}

export async function listMembers(): Promise<MemberRow[]> {
  const admin = createAdminClient();

  const [profilesResult, usersResult, progressResult] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from("user_item_progress")
      .select("user_id, completed_at, last_opened_at"),
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }
  if (usersResult.error) {
    throw new Error(usersResult.error.message);
  }
  if (progressResult.error) {
    throw new Error(progressResult.error.message);
  }

  const authById = new Map(
    (usersResult.data.users ?? []).map((user) => [user.id, user]),
  );

  const progressByUser = new Map<string, ProgressAgg>();
  for (const row of progressResult.data ?? []) {
    const current = progressByUser.get(row.user_id) ?? {
      completedCount: 0,
      lastActiveAt: null as string | null,
    };
    if (row.completed_at) {
      current.completedCount += 1;
    }
    if (row.last_opened_at) {
      if (
        !current.lastActiveAt ||
        new Date(row.last_opened_at).getTime() >
          new Date(current.lastActiveAt).getTime()
      ) {
        current.lastActiveAt = row.last_opened_at;
      }
    }
    progressByUser.set(row.user_id, current);
  }

  return (profilesResult.data ?? []).map((profile) => {
    const authUser = authById.get(profile.id);
    const email = authUser?.email ?? "";
    const progress = progressByUser.get(profile.id);

    return {
      id: profile.id,
      fullName: displayName(
        profile.full_name,
        authUser?.user_metadata?.full_name,
        email,
      ),
      email: email || "—",
      role: profile.role === "admin" ? "admin" : "viewer",
      status: isSuspended(authUser?.banned_until) ? "suspended" : "active",
      joinedAt: profile.created_at,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      completedCount: progress?.completedCount ?? 0,
      lastActiveAt: progress?.lastActiveAt ?? null,
    };
  });
}

export async function countMembers(): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}
