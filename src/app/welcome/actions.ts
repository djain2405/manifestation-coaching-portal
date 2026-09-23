"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/session";
import { WELCOME_COOKIE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeInternalPath } from "@/lib/site";

export async function dismissWelcomeAction(formData: FormData) {
  const next = safeInternalPath(String(formData.get("next") ?? "/"), "/");
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  if (profile.id === "legacy" || !isSupabaseConfigured()) {
    const cookieStore = await cookies();
    cookieStore.set(WELCOME_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    redirect(next);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ welcome_seen_at: new Date().toISOString() })
    .eq("id", profile.id);

  if (error && (error.message.includes("welcome_seen_at") || error.code === "42703")) {
    const cookieStore = await cookies();
    cookieStore.set(WELCOME_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else if (error) {
    console.error("Failed to save welcome_seen_at:", error.message);
  }

  redirect(next);
}
