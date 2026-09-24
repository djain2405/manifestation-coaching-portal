import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/session";
import { getCurriculum } from "@/lib/curriculum";
import { changePasswordAction } from "@/app/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AuthShell } from "@/components/AuthShell";
import {
  decodePasswordChangeReason,
  passwordChangeErrorCopy,
} from "@/lib/password-errors";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string; reason?: string }>;
};

export default async function AccountPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const { site } = await getCurriculum();
  const admin = await isAdmin();
  const { error, reason } = await searchParams;
  const errorMessage = error ? passwordChangeErrorCopy(error) : null;
  const errorDetail = decodePasswordChangeReason(reason);

  return (
    <AuthShell
      site={site}
      eyebrow={site.title}
      title="Change password"
      description="Choose a new password. You’ll go back to your space after you save."
      showPrivacyNote={false}
      footer={
        <p className="text-base text-muted">
          <a href="/" className="font-medium text-accent underline">
            Back to your space
          </a>
          {admin ? (
            <>
              {" · "}
              <a href="/admin" className="font-medium text-accent underline">
                Admin
              </a>
            </>
          ) : null}
        </p>
      }
    >
      <form
        action={changePasswordAction}
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
            Confirm new password
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
          <div className="space-y-1 text-center" role="alert">
            <p className="text-base text-red-500">{errorMessage}</p>
            {errorDetail && errorDetail !== errorMessage ? (
              <p className="text-sm text-red-500/80">{errorDetail}</p>
            ) : null}
          </div>
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
