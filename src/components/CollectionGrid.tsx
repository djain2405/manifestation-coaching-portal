import type { CSSProperties } from "react";
import Link from "next/link";
import type { Collection, Site, SiteLabels } from "@/lib/types";
import { getCoverClassName, isLightCover } from "@/lib/collection-style";
import { formatLabel } from "@/lib/labels";
import { SignOutButton } from "./SignOutButton";
import { ChangePasswordLink } from "./ChangePasswordLink";
import { BrandGlyph } from "./BrandMark";

type Props = {
  site: Site;
  collections: Collection[];
  labels: SiteLabels;
  showAdminLink?: boolean;
  firstName?: string;
  passwordUpdated?: boolean;
};

export function CollectionGrid({
  site,
  collections,
  labels,
  showAdminLink,
  firstName,
  passwordUpdated,
}: Props) {
  const greeting = firstName
    ? formatLabel(labels.welcomeBackName ?? "Welcome back, {name}.", {
        name: firstName,
      })
    : (labels.welcomeBack ?? "Welcome back");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-3 text-center sm:text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 text-accent sm:justify-start">
              <BrandGlyph className="h-10 w-10" />
              <h1 className="font-display text-4xl text-foreground sm:text-5xl">
                {site.title}
              </h1>
            </div>
            <p className="text-base font-medium text-accent">{greeting}</p>
            {passwordUpdated ? (
              <p className="text-base text-accent" role="status">
                Your password was updated.
              </p>
            ) : null}
            <p className="max-w-xl text-lg text-muted">{site.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
            {showAdminLink ? (
              <Link
                href="/admin"
                prefetch={false}
                className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent"
              >
                Admin
              </Link>
            ) : null}
            <ChangePasswordLink />
            <SignOutButton />
          </div>
        </div>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2">
        {collections.map((collection) => {
          const cover = getCoverClassName(collection);
          const lightCover = isLightCover(cover);
          const accent = collection.accent ?? "#163832";
          return (
            <li key={collection.slug}>
              <Link
                href={`/course/${collection.slug}`}
                prefetch={false}
                className="hover-lift group block overflow-hidden rounded-3xl border border-border bg-card"
                style={
                  { ["--accent" as string]: accent } as CSSProperties
                }
              >
                <div
                  className={`relative overflow-hidden bg-gradient-to-br ${cover} p-8 transition-opacity group-hover:opacity-95`}
                >
                  <BrandGlyph
                    className={`h-10 w-10 ${lightCover ? "text-foreground/80" : "text-white/80"}`}
                  />
                </div>
                <div className="space-y-2 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {formatLabel(labels.lessonsCount ?? "{count} lessons", {
                      count: collection.items.length,
                    })}
                  </p>
                  <h2 className="font-display text-2xl text-foreground group-hover:text-accent">
                    {collection.title}
                  </h2>
                  <p className="line-clamp-2 text-sm text-muted">
                    {collection.description}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
