"use client";

import Link from "next/link";
import type { Item } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { getItemDuration, isActivityItem } from "@/lib/items";

type Props = {
  collectionSlug: string;
  items: Item[];
  labels: SiteLabels;
  isComplete: (slug: string) => boolean;
  hydrated: boolean;
  activeSlug?: string;
};

export function LessonList({
  collectionSlug,
  items,
  labels,
  isComplete,
  hydrated,
  activeSlug,
}: Props) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const isActivity = isActivityItem(item);
        const duration = getItemDuration(item);
        const done = hydrated && isComplete(item.slug);
        const active = item.slug === activeSlug;

        return (
          <li key={item.slug}>
            <Link
              href={`/course/${collectionSlug}/${item.slug}`}
              prefetch={false}
              className={`hover-lift flex min-h-14 items-center gap-4 rounded-2xl border bg-white p-4 sm:min-h-16 sm:p-5 ${
                active
                  ? "border-accent/60 shadow-sm ring-1 ring-accent/20"
                  : "border-border hover:border-accent/30"
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {item.emoji ?? (isActivity ? "📝" : "▶")}
              </span>
              <div className="min-w-0 flex-1">
                {item.subtitle ? (
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">
                    {item.subtitle}
                  </p>
                ) : null}
                <h3 className="font-display text-lg text-foreground sm:text-xl">
                  {item.title}
                </h3>
                {duration ? (
                  <p className="text-sm text-muted">{duration} min</p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                {isActivity ? (
                  <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                    {labels.activity}
                  </span>
                ) : null}
                {done ? (
                  <span className="mt-1 block text-sm font-medium text-accent">
                    {labels.done} ✓
                  </span>
                ) : (
                  <span className="mt-1 block text-sm text-muted">
                    {index + 1} / {items.length}
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
