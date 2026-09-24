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
import { getSiteUrl } from "@/lib/site-url";
import {
  classifyPasswordChangeError,
  isSessionAuthError,
} from "@/lib/password-errors";

function safeRedirectPath(from: FormDataEntryValue | null): string {
  if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return "/";
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
  const origin = getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error("Password reset email failed:", error.message);
    redirect("/login?error=reset");
  }

  redirect("/login?reset=sent");
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 8 || password !== confirm) {
    redirect("/reset-password?error=invalid");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=reset");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Password update failed:", error.message);
    redirect("/reset-password?error=update");
  }

  redirect("/");
}

function failPasswordChange(error: {
  message: string;
  code?: string;
  status?: number;
}): never {
  console.error(
    "Password change failed:",
    error.code ?? "",
    error.status ?? "",
    error.message,
  );
  const kind = classifyPasswordChangeError(error.message, error.code);
  const reason = encodeURIComponent(error.message.slice(0, 180));
  redirect(`/account?error=${kind}&reason=${reason}`);
}

export async function changePasswordAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 8 || password !== confirm) {
    redirect("/account?error=invalid");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    failPasswordChange(userError);
  }
  if (!user) {
    redirect("/login");
  }

  const bannedUntil = user.banned_until;
  if (bannedUntil) {
    const until = new Date(bannedUntil).getTime();
    if (Number.isFinite(until) && until > Date.now()) {
      redirect("/login?error=suspended");
    }
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (!error) {
    redirect("/?password=updated");
  }

  if (isSessionAuthError(error.message, error.code, error.status)) {
    try {
      const admin = createAdminClient();
      const { error: adminError } = await admin.auth.admin.updateUserById(
        user.id,
        { password },
      );
      if (!adminError) {
        redirect("/?password=updated");
      }
      failPasswordChange(adminError);
    } catch (err) {
      failPasswordChange({
        message: err instanceof Error ? err.message : error.message,
        code: error.code,
        status: error.status,
      });
    }
  }

  failPasswordChange(error);
}
