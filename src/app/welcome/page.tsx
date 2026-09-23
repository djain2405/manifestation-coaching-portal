import { redirect } from "next/navigation";
import { getProfile } from "@/lib/session";
import { getCollections, getCurriculum } from "@/lib/curriculum";
import { firstName, getCoachName, getWelcomeMessage } from "@/lib/site";
import { formatLabel, getLabels } from "@/lib/labels";
import { BrandGlyph } from "@/components/BrandMark";
import { AuthOrnament } from "@/components/Ornaments";
import { CoachPresence } from "@/components/CoachPresence";
import { dismissWelcomeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  if (profile.welcome_seen_at) {
    redirect("/");
  }

  const [{ site }, collections] = await Promise.all([
    getCurriculum(),
    getCollections(),
  ]);
  const labels = getLabels(site);
  const name = firstName(profile.full_name);
  const heading = name
    ? formatLabel(labels.welcomeName, { name })
    : "Welcome.";
  const firstCollection = collections[0];
  const firstItem = firstCollection?.items[0];
  const singleSeries = collections.length === 1;
  const startHref =
    singleSeries && firstCollection && firstItem
      ? `/course/${firstCollection.slug}/${firstItem.slug}`
      : singleSeries && firstCollection
        ? `/course/${firstCollection.slug}`
        : "/";
  const ctaLabel =
    singleSeries && firstItem
      ? formatLabel(labels.beginWith, { title: firstItem.title })
      : "Enter your space";
  const coachName = site.coachName?.trim();

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      <AuthOrnament />
      <div className="relative z-10 w-full max-w-lg space-y-10 text-center">
        <div className="space-y-4">
          <div className="flex justify-center text-accent">
            <BrandGlyph className="h-14 w-14" />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-accent">
            You&apos;re in the right place
          </p>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            {heading}
          </h1>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-white/90 p-8 text-left shadow-sm">
          {coachName ? (
            <CoachPresence
              name={coachName}
              photoUrl={site.coachPhotoUrl}
              size="md"
            />
          ) : (
            <p className="font-display text-lg text-foreground">
              From {getCoachName(site)}
            </p>
          )}
          <p className="text-lg text-muted">{getWelcomeMessage(site)}</p>
        </div>

        <ul className="grid gap-3 text-left sm:grid-cols-3">
          <li className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="font-display text-base text-foreground">Invite-only</p>
            <p className="mt-1 text-sm text-muted">
              Only people who were invited can get in.
            </p>
          </li>
          <li className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="font-display text-base text-foreground">Private notes</p>
            <p className="mt-1 text-sm text-muted">
              Worksheets save for you. This is not a public classroom.
            </p>
          </li>
          <li className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="font-display text-base text-foreground">Your pace</p>
            <p className="mt-1 text-sm text-muted">
              Watch, reflect, mark done. Nothing here is timed.
            </p>
          </li>
        </ul>

        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.1em] text-accent">
            How it works
          </p>
          <ol className="flex flex-col gap-2 text-left sm:flex-row sm:gap-4">
            <li className="flex-1 rounded-2xl border border-border/80 bg-white/70 px-4 py-3">
              <span className="text-xs text-muted">1</span>
              <p className="font-display text-foreground">Watch</p>
            </li>
            <li className="flex-1 rounded-2xl border border-border/80 bg-white/70 px-4 py-3">
              <span className="text-xs text-muted">2</span>
              <p className="font-display text-foreground">Reflect</p>
            </li>
            <li className="flex-1 rounded-2xl border border-border/80 bg-white/70 px-4 py-3">
              <span className="text-xs text-muted">3</span>
              <p className="font-display text-foreground">Mark complete</p>
            </li>
          </ol>
        </div>

        <form action={dismissWelcomeAction}>
          <input type="hidden" name="next" value={startHref} />
          <button
            type="submit"
            className="inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-accent px-8 text-lg font-semibold text-accent-foreground shadow-sm hover:opacity-90"
          >
            {ctaLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
