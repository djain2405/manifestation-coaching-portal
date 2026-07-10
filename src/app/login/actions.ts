"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfiguredAdminEmail } from "@/lib/admin-emails";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getPortalPassword,
  isAuthenticated,
  PORTAL_COOKIE,
  PORTAL_COOKIE_VALUE,
} from "@/lib/auth";
import { cookies } from "next/headers";
import { DEFAULT_COURSE_PATH } from "@/lib/constants";

function safeRedirectPath(from: FormDataEntryValue | null): string {
  if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return DEFAULT_COURSE_PATH;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(formData.get("from"));

  if (!isSupabaseConfigured()) {
    if (password !== getPortalPassword()) {
      redirect(`/login?error=invalid&from=${encodeURIComponent(redirectTo)}`);
    }
    const cookieStore = await cookies();
    cookieStore.set(PORTAL_COOKIE, PORTAL_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect(redirectTo);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("ban") || message.includes("suspend")) {
      redirect(`/login?error=suspended&from=${encodeURIComponent(redirectTo)}`);
    }
    redirect(`/login?error=invalid&from=${encodeURIComponent(redirectTo)}`);
  }

  redirect(redirectTo);
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    cookieStore.delete(PORTAL_COOKIE);
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signupAction(formData: FormData) {
  const token = String(formData.get("invite") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!token || !password || password !== confirm) {
    redirect(`/signup?invite=${token}&error=invalid`);
  }

  const admin = createAdminClient();
  let invite;
  try {
    const { data, error: inviteError } = await admin
      .from("invites")
      .select("*")
      .eq("token", token)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (inviteError) {
      console.error("Invite lookup failed:", inviteError.message);
      redirect(`/signup?invite=${token}&error=service`);
    }
    invite = data;
  } catch (error) {
    console.error("Invite lookup failed:", error);
    redirect(`/signup?invite=${token}&error=service`);
  }

  if (!invite || invite.revoked_at) {
    redirect(`/signup?invite=${token}&error=invite`);
  }

  // Person-bound invites only — reject legacy open invites and trust invite.email
  const email = invite.email?.trim().toLowerCase() ?? "";
  if (!email) {
    redirect(`/signup?invite=${token}&error=invite`);
  }

  const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (signUpError || !authData.user) {
    redirect(`/signup?invite=${token}&error=signup`);
  }

  if (isConfiguredAdminEmail(email)) {
    const { error: roleError } = await admin
      .from("profiles")
      .update({ role: "admin", full_name: fullName })
      .eq("id", authData.user.id);
    if (roleError) {
      console.error("Admin role assignment failed:", roleError.message);
    }
  } else if (fullName) {
    await admin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", authData.user.id);
  }

  await admin
    .from("invites")
    .update({ used_at: new Date().toISOString(), used_by: authData.user.id })
    .eq("id", invite.id);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Post-signup sign-in failed:", signInError.message);
    redirect("/login?from=/");
  }

  redirect("/");
}

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !isSupabaseConfigured()) {
    redirect("/login?error=reset");
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login?reset=sent`,
  });
  redirect("/login?reset=sent");
}
