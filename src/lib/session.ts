import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfiguredAdminEmail } from "@/lib/admin-emails";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  isAuthenticated as legacyIsAuthenticated,
  PORTAL_COOKIE,
} from "@/lib/auth";
import { cookies } from "next/headers";

export type UserProfile = {
  id: string;
  full_name: string | null;
  role: "admin" | "viewer";
};

export async function getSessionUser() {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    if (legacyIsAuthenticated(cookieStore.get(PORTAL_COOKIE)?.value)) {
      return { id: "legacy", email: "legacy@local" } as const;
    }
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const bannedUntil = user.banned_until;
  if (bannedUntil) {
    const until = new Date(bannedUntil).getTime();
    if (Number.isFinite(until) && until > Date.now()) {
      await supabase.auth.signOut();
      return null;
    }
  }

  return user;
}

async function promoteAdminIfConfiguredEmail(
  user: { id: string; email?: string | null },
  profile: UserProfile | null,
): Promise<UserProfile | null> {
  if (profile?.role === "admin") return profile;

  if (!isConfiguredAdminEmail(user.email)) return profile;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id)
    .select("id, full_name, role")
    .single();

  if (error) {
    console.error("Failed to promote admin role:", error.message);
    return profile;
  }

  return data as UserProfile;
}

export async function getProfile(): Promise<UserProfile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.id === "legacy") {
    return { id: "legacy", full_name: "Guest", role: "admin" };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  const profile = data as UserProfile | null;
  return promoteAdminIfConfiguredEmail(user, profile);
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/");
  return profile;
}

export async function checkAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return Boolean(user);
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.role === "admin";
}
