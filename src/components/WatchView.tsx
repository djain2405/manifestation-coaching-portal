"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Collection, Item } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";
import { isWatchItem } from "@/lib/items";
import { EmbedPlayer } from "./EmbedPlayer";
import { CompleteBurst } from "./CompleteBurst";

type Props = {
  collection: Collection;
  item: Item;
  index: number;
  labels: SiteLabels;
};

export function WatchView({ collection, item, index, labels }: Props) {
  const items = collection.items;
  const { toggleComplete, setLastLesson, isComplete, hydrated } = useProgress(
    collection.slug,
    items,
  );

  const [burst, setBurst] = useState(false);

  useEffect(() => {
    setLastLesson(item.slug);
  }, [item.slug, setLastLesson]);

  const prev = index > 0 ? items[index - 1] : null;
  const next = index < items.length - 1 ? items[index + 1] : null;
  const done = hydrated && isComplete(item.slug);
  const embed =
    item.embed ??
    (isWatchItem(item) ? { provider: "youtube" as const, id: "pending" } : undefined);

  function handleToggle() {
    const wasDone = done;
    toggleComplete(item.slug);
    if (!wasDone) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 2000);
    }
  }

  return (
    <>
      <article className="space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {item.emoji ? (
              <span className="text-2xl" aria-hidden>
                {item.emoji}
              </span>
            ) : null}
            {item.subtitle ? (
              <p className="text-sm font-medium uppercase tracking-[0.1em] text-accent">
                {item.subtitle}
              </p>
            ) : null}
          </div>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            {item.title}
          </h1>
          {item.description ? (
            <p className="max-w-2xl text-lg text-muted">{item.description}</p>
          ) : null}
          {item.highlight ? (
            <blockquote className="border-l-2 border-accent/60 pl-4 font-display text-xl italic text-muted">
              {item.highlight}
            </blockquote>
          ) : null}
        </header>

        {embed ? (
          <EmbedPlayer embed={embed} title={item.title} />
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={handleToggle}
            className={`min-h-14 w-full rounded-lg px-6 py-3.5 text-base font-semibold sm:w-auto ${
              done
                ? "bg-accent/20 text-accent ring-1 ring-accent/40"
                : "bg-accent text-accent-foreground shadow-sm hover:opacity-90"
            }`}
          >
            {done ? labels.markUnwatched : labels.markWatched}
          </button>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row">
            {prev ? (
              <Link
                href={`/course/${collection.slug}/${prev.slug}`}
                prefetch={false}
                className="min-h-12 rounded-lg border border-border px-5 py-3 text-center text-base text-foreground hover:bg-surface-elevated"
              >
                ← {prev.title}
              </Link>
            ) : null}
            {next ? (
              <Link
                href={`/course/${collection.slug}/${next.slug}`}
                prefetch={false}
                className="min-h-12 rounded-lg border border-accent/50 bg-accent/10 px-5 py-3 text-center text-base font-semibold text-accent"
              >
                {labels.upNext}: {next.title} →
              </Link>
            ) : (
              <Link
                href={`/course/${collection.slug}`}
                prefetch={false}
                className="min-h-12 rounded-lg border border-border px-5 py-3 text-center text-base"
              >
                Back to {collection.title}
              </Link>
            )}
          </div>
        </div>
      </article>

      <CompleteBurst show={burst} />
    </>
  );
}
