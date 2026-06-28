import { redirect } from "next/navigation";
import { checkAuthenticated } from "@/lib/session";
import { signupAction } from "@/app/login/actions";
import { getCurriculum } from "@/lib/curriculum";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ invite?: string; error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Please fill in all fields and make sure your passwords match.",
  invite: "This invite link is invalid or has expired. Ask the host for a new one.",
  email: "This invite is for a different email address.",
  signup: "We couldn’t create your account. The email may already be in use.",
};

export default async function SignupPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const params = await searchParams;
  const token = params.invite;

  if (!token) {
    redirect("/login");
  }

  if (await checkAuthenticated()) {
    redirect("/");
  }

  const { site } = await getCurriculum();
  const errorKey = params.error;
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : null;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-accent">
            You&apos;re invited
          </p>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Join {site.title}
          </h1>
          <p className="text-lg text-muted">
            Create your account to start watching and taking notes.
          </p>
        </div>

        <form
          action={signupAction}
          className="space-y-5 rounded-2xl border border-border bg-white p-8 text-left shadow-sm"
        >
          <input type="hidden" name="invite" value={token} />

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-base font-medium text-foreground">
              Your name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className="w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3.5 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

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
              className="w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3.5 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-base font-medium text-foreground">
              Password
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
            <label htmlFor="confirmPassword" className="text-base font-medium text-foreground">
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
            Create account
          </button>
        </form>

        <p className="text-base text-muted">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-accent underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
