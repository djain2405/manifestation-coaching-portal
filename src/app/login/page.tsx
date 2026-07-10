import { redirect } from "next/navigation";
import { checkAuthenticated } from "@/lib/session";
import { getCurriculum } from "@/lib/curriculum";
import { loginAction } from "@/app/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    from?: string;
    error?: string;
    reset?: string;
  }>;
};

function safeFrom(from: string | undefined): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return "/";
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  if (await checkAuthenticated()) {
    redirect(safeFrom(params.from));
  }

  const { site } = await getCurriculum();
  const redirectTo = safeFrom(params.from);
  const showError = params.error === "invalid";
  const showSuspended = params.error === "suspended";
  const resetSent = params.reset === "sent";
  const useEmail = isSupabaseConfigured();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-accent">
            Welcome back
          </p>
          <h1 className="font-display text-5xl leading-tight text-foreground sm:text-6xl">
            {site.title}
          </h1>
          <p className="text-lg text-muted">{site.tagline}</p>
        </div>

        <form
          action={loginAction}
          className="space-y-5 rounded-2xl border border-border bg-white p-8 text-left shadow-sm"
        >
          <input type="hidden" name="from" value={redirectTo} />

          {useEmail ? (
            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3.5 text-base text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="password" className="text-base font-medium text-foreground">
              {useEmail ? "Password" : "Portal key"}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3.5 text-base text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {!useEmail ? (
              <p className="text-sm text-muted">{site.passwordHint}</p>
            ) : null}
          </div>

          {showError ? (
            <p className="text-center text-base text-red-500" role="alert">
              {useEmail
                ? "That email or password didn’t work. Please try again."
                : "That key didn’t work — try again."}
            </p>
          ) : null}

          {showSuspended ? (
            <p className="text-center text-base text-red-500" role="alert">
              This account has been suspended. Contact the host if you need
              access restored.
            </p>
          ) : null}

          {resetSent ? (
            <p className="text-center text-base text-accent" role="status">
              Check your email for a password reset link.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full min-h-12 rounded-lg bg-accent py-3.5 text-base font-semibold text-accent-foreground shadow-sm hover:opacity-90"
          >
            Sign in
          </button>
        </form>

        {useEmail ? <ForgotPasswordForm /> : null}
      </div>
    </div>
  );
}
