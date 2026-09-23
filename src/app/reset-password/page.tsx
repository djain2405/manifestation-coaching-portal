import { redirect } from "next/navigation";
import { checkAuthenticated } from "@/lib/session";
import { getCurriculum } from "@/lib/curriculum";
import { updatePasswordAction } from "@/app/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AuthShell } from "@/components/AuthShell";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  if (!(await checkAuthenticated())) {
    redirect("/login?error=reset");
  }

  const { site } = await getCurriculum();
  const { error } = await searchParams;
  const errorMessage =
    error === "invalid"
      ? "Passwords must match and be at least 8 characters."
      : error === "update"
        ? "We couldn’t update your password. Request a new reset link."
        : null;

  return (
    <AuthShell
      site={site}
      eyebrow={site.title}
      title="Choose a new password"
      description="Enter a new password for your account."
      showPrivacyNote={false}
    >
      <form
        action={updatePasswordAction}
        className="space-y-5 rounded-2xl border border-border bg-white p-8 text-left shadow-sm"
      >
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-base font-medium text-foreground"
          >
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3.5 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-base font-medium text-foreground"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3.5 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {errorMessage ? (
          <p className="text-center text-base text-red-500" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full min-h-12 rounded-lg bg-accent py-3.5 text-base font-semibold text-accent-foreground shadow-sm hover:opacity-90"
        >
          Save password
        </button>
      </form>
    </AuthShell>
  );
}
