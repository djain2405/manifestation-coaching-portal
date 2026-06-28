import type { CSSProperties } from "react";
import Link from "next/link";
import type { Collection, Site } from "@/lib/types";
import { getCoverClassName } from "@/lib/collection-style";
import { SignOutButton } from "./SignOutButton";

type Props = {
  site: Site;
  collections: Collection[];
};

export function CollectionGrid({ site, collections }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-3 text-center sm:text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <h1 className="font-display text-4xl text-foreground sm:text-5xl">
              {site.title}
            </h1>
            <p className="max-w-xl text-lg text-muted">{site.tagline}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2">
        {collections.map((collection) => {
          const cover = getCoverClassName(collection);
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
                  className={`bg-gradient-to-br ${cover} p-8 transition-opacity group-hover:opacity-95`}
                >
                  <span className="text-3xl" aria-hidden>
                    {collection.items[0]?.emoji ?? "✦"}
                  </span>
                </div>
                <div className="space-y-2 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {collection.items.length} pieces
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
