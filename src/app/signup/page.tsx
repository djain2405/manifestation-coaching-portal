import { redirect } from "next/navigation";
import { checkAuthenticated } from "@/lib/session";
import { signupAction } from "@/app/login/actions";
import { getCurriculum } from "@/lib/curriculum";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthShell } from "@/components/AuthShell";
import { CoachPresence } from "@/components/CoachPresence";
import { getCoachPossessive, getHelpLine } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ invite?: string; error?: string }>;
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

  const admin = createAdminClient();
  const { data: invite, error: inviteLookupError } = await admin
    .from("invites")
    .select("email, expires_at, used_at, revoked_at")
    .eq("token", token)
    .maybeSingle();

  const inviteEmail = invite?.email?.trim().toLowerCase() ?? "";
  const inviteUsable =
    Boolean(invite) &&
    !inviteLookupError &&
    !invite?.used_at &&
    !invite?.revoked_at &&
    Boolean(inviteEmail) &&
    new Date(invite!.expires_at).getTime() > Date.now();

  const { site } = await getCurriculum();
  const help = getHelpLine(site);
  const possessive = getCoachPossessive(site);
  const coachName = site.coachName?.trim();

  const ERROR_MESSAGES: Record<string, string> = {
    invalid: "Please fill in all fields and make sure your passwords match.",
    invite: `This invite link is invalid, revoked, or has expired. ${help}`,
    email: "This invite is for a different email address.",
    signup: "We couldn’t create your account. The email may already be in use.",
    service: "We couldn’t reach the account service. Please try again shortly.",
  };

  const errorKey = params.error;
  const errorMessage = errorKey
    ? ERROR_MESSAGES[errorKey]
    : !inviteUsable
      ? ERROR_MESSAGES.invite
      : null;

  if (!inviteUsable) {
    return (
      <AuthShell
        site={site}
        eyebrow="Invite"
        title="Invite unavailable"
        description={ERROR_MESSAGES.invite}
        footer={
          <a href="/login" className="font-medium text-accent underline">
            Sign in
          </a>
        }
      />
    );
  }

  return (
    <AuthShell
      site={site}
      eyebrow="You're invited"
      title={site.title}
      description={`Create your account to enter ${possessive} space. This link is only for you.`}
      presence={
        coachName ? (
          <div className="flex justify-center pt-2">
            <CoachPresence
              name={coachName}
              photoUrl={site.coachPhotoUrl}
              size="sm"
            />
          </div>
        ) : null
      }
      footer={
        <p className="text-base text-muted">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-accent underline">
            Sign in
          </a>
        </p>
      }
    >
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
            defaultValue={inviteEmail}
            readOnly
            autoComplete="email"
            className="w-full min-h-12 cursor-not-allowed rounded-xl border border-border bg-surface/80 px-4 py-3.5 text-base text-muted"
          />
          <p className="text-sm text-muted">
            This invite is locked to this email address.
          </p>
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

        <ul className="space-y-1 text-sm text-muted">
          <li>Private — only people who were invited can enter.</li>
          <li>Your notes stay with you and save as you write.</li>
          <li>Move at your own pace. Nothing here is timed.</li>
        </ul>

        <button
          type="submit"
          className="w-full min-h-12 rounded-lg bg-accent py-3.5 text-base font-semibold text-accent-foreground shadow-sm hover:opacity-90"
        >
          Enter your space
        </button>
      </form>
    </AuthShell>
  );
}
