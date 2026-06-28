"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Collection, Item } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";
import { ActivityForm } from "./ActivityForm";
import { CompleteBurst } from "./CompleteBurst";

type Props = {
  collection: Collection;
  item: Item;
  index: number;
  labels: SiteLabels;
};

export function ActivityView({ collection, item, index, labels }: Props) {
  const activity = item.activity;
  const items = collection.items;
  const { toggleComplete, setLastLesson, isComplete, hydrated } = useProgress(
    collection.slug,
    items,
  );

  const [burst, setBurst] = useState(false);

  useEffect(() => {
    setLastLesson(item.slug);
  }, [item.slug, setLastLesson]);

  if (!activity) {
    return null;
  }

  const prev = index > 0 ? items[index - 1] : null;
  const next = index < items.length - 1 ? items[index + 1] : null;
  const done = hydrated && isComplete(item.slug);

  function handleToggle() {
    const wasDone = done;
    toggleComplete(item.slug);
    if (!wasDone) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 2000);
    }
  }

  const timeLabel = activity.estimatedMinutes
    ? `~${activity.estimatedMinutes} min`
    : null;

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
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent">
              {labels.activity}
            </span>
            {timeLabel ? (
              <span className="text-sm text-muted">{timeLabel}</span>
            ) : null}
          </div>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            {item.title}
          </h1>
          {item.description ? (
            <p className="max-w-2xl text-lg text-muted">{item.description}</p>
          ) : null}
          {activity.intro ? (
            <p className="max-w-2xl rounded-xl border border-border bg-card px-4 py-3 text-foreground">
              {activity.intro}
            </p>
          ) : null}
        </header>

        {activity.pdf ? (
          <section className="rounded-2xl border border-border bg-surface/50 p-6">
            <h2 className="mb-3 font-display text-xl text-foreground">
              {labels.printCopy}
            </h2>
            <a
              href={activity.pdf}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-accent/40 bg-white px-6 py-3 text-base font-semibold text-accent hover:bg-accent/5"
            >
              <span aria-hidden>↓</span>
              {activity.pdfLabel ?? labels.downloadWorksheet}
            </a>
          </section>
        ) : null}

        <section className="rounded-2xl border border-border bg-white p-6">
          <ActivityForm
            collectionSlug={collection.slug}
            itemSlug={item.slug}
            itemId={item.id}
            activity={activity}
            labels={labels}
          />
        </section>

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
            {done ? labels.markActivityUndone : labels.markActivityDone}
          </button>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row">
            {prev ? (
              <Link
                href={`/course/${collection.slug}/${prev.slug}`}
                prefetch={false}
                className="min-h-12 rounded-lg border border-border px-5 py-3 text-center text-base"
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

      <CompleteBurst show={burst} message="Nice — worksheet complete" />
    </>
  );
}
