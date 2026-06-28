"use client";

import Link from "next/link";
import type { Item } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { getItemDuration, isActivityItem } from "@/lib/items";

type Props = {
  collectionSlug: string;
  item: Item;
  index: number;
  done: boolean;
  labels: SiteLabels;
  active?: boolean;
};

export function EpisodeCard({
  collectionSlug,
  item,
  index,
  done,
  labels,
  active,
}: Props) {
  const isActivity = isActivityItem(item);
  const duration = getItemDuration(item);

  return (
    <Link
      href={`/course/${collectionSlug}/${item.slug}`}
      prefetch={false}
      className={`hover-lift group flex w-[min(100%,220px)] shrink-0 flex-col overflow-hidden rounded-2xl border bg-card sm:w-[200px] ${
        active
          ? "border-accent/60 shadow-md shadow-accent/15"
          : "border-border/80 hover:border-accent/30"
      }`}
    >
      <div
        className={`relative flex flex-col justify-between p-4 ${
          isActivity ? "min-h-[140px] aspect-auto" : "aspect-[4/5]"
        } ${done ? "bg-accent/10" : "bg-surface-elevated"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-2xl" aria-hidden>
            {item.emoji ?? (isActivity ? "📝" : "◎")}
          </span>
          {isActivity ? (
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
              {labels.activity}
            </span>
          ) : null}
        </div>
        {!isActivity ? (
          <span className="font-display text-4xl text-foreground/[0.07]">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
        {done ? (
          <span className="absolute right-3 top-3 rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
            {labels.done}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-4">
        {item.subtitle ? (
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            {item.subtitle}
          </p>
        ) : null}
        <h3 className="font-display text-lg leading-tight text-foreground group-hover:text-accent">
          {item.title}
        </h3>
        {duration ? (
          <p className="text-xs text-muted">{duration} min</p>
        ) : null}
      </div>
    </Link>
  );
}
