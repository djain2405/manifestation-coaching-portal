import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/session";
import { getCurriculum } from "@/lib/curriculum";
import { changePasswordAction } from "@/app/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AccountPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const { site } = await getCurriculum();
  const admin = await isAdmin();
  const { error } = await searchParams;
  const errorMessage =
    error === "invalid"
      ? "Passwords must match and be at least 8 characters."
      : error === "update"
        ? "We couldn’t update your password. Please try again."
        : null;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-accent">
            {site.title}
          </p>
          <h1 className="font-display text-4xl text-foreground">
            Change password
          </h1>
          <p className="text-lg text-muted">
            Choose a new password. You’ll go back to your space after you save.
          </p>
        </div>

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
      </div>
    </div>
  );
}
