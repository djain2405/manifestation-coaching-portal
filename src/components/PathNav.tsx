"use client";

import Link from "next/link";
import type { Collection } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";
import { isActivityItem } from "@/lib/items";

type Props = {
  collection: Collection;
  labels: SiteLabels;
  activeItemSlug?: string;
};

export function PathNav({ collection, labels, activeItemSlug }: Props) {
  const items = collection.items;
  const { isComplete, hydrated } = useProgress(collection.slug, items);

  return (
    <nav aria-label={labels.path} className="flex flex-col">
      <p className="mb-4 px-2 text-xs font-medium uppercase tracking-[0.1em] text-accent">
        {labels.path}
      </p>
      <ol className="relative flex flex-col gap-0">
        {collection.items.map((item, index) => {
          const done = hydrated && isComplete(item.slug);
          const active = item.slug === activeItemSlug;
          const isLast = index === collection.items.length - 1;
          const isActivity = isActivityItem(item);

          return (
            <li key={item.slug} className="relative flex gap-3 pb-6">
              {!isLast ? (
                <span
                  className={`absolute left-[11px] top-6 h-[calc(100%-8px)] w-0.5 ${
                    done ? "bg-accent/60" : "bg-border"
                  }`}
                  aria-hidden
                />
              ) : null}
              <span
                className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-xs ${
                  isActivity ? "rounded-md" : "rounded-full"
                } ${
                  done
                    ? "bg-accent text-accent-foreground shadow-sm shadow-accent/25"
                    : active
                      ? "border-2 border-accent bg-accent/20 text-accent"
                      : "border border-border bg-card text-muted"
                }`}
                aria-hidden
              >
                {done ? "✓" : item.emoji ?? (isActivity ? "📝" : "·")}
              </span>
              <Link
                href={`/course/${collection.slug}/${item.slug}`}
                prefetch={false}
                className={`min-h-12 min-w-0 flex-1 rounded-lg px-2 py-2 transition-colors ${
                  active ? "bg-accent/15" : "hover:bg-surface-elevated"
                }`}
              >
                <span
                  className={`block text-base font-medium leading-snug ${
                    active ? "text-accent" : "text-foreground"
                  }`}
                >
                  {item.title}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-2">
                  {isActivity ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                      {labels.activity}
                    </span>
                  ) : null}
                  {item.subtitle ? (
                    <span className="text-xs text-muted">{item.subtitle}</span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
