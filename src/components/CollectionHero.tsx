"use client";

import Link from "next/link";
import type { Collection } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";

type Props = {
  collection: Collection;
  labels: SiteLabels;
  coverClass: string;
  continueHref: string;
  continueLabel: string;
  percent: number;
  completedCount: number;
  hydrated: boolean;
  welcomeLine?: string | null;
  progressSummary: string;
};

export function CollectionHero({
  collection,
  labels,
  coverClass,
  continueHref,
  continueLabel,
  percent,
  completedCount,
  hydrated,
  welcomeLine,
  progressSummary,
}: Props) {
  const total = collection.items.length;

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br ${coverClass} p-8 sm:p-10`}
    >
      <div className="relative z-10 max-w-2xl space-y-6">
        {welcomeLine ? (
          <p className="text-base font-medium text-white/90">{welcomeLine}</p>
        ) : null}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-white/70">
            {labels.collection}
          </p>
          <h1 className="font-display text-4xl leading-[1.08] text-white sm:text-5xl">
            {collection.title}
          </h1>
          <p className="text-lg text-white/80">{collection.description}</p>
        </div>

        {hydrated ? (
          <div className="space-y-3">
            <p className="text-lg font-medium text-white">{progressSummary}</p>
            <ProgressBar
              percent={percent}
              completedCount={completedCount}
              total={total}
              progressLabel={labels.progress ?? "finished"}
              onDark
            />
          </div>
        ) : (
          <div className="h-10 animate-pulse rounded-lg bg-white/10" aria-hidden />
        )}

        <Link
          href={continueHref}
          prefetch={false}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-accent shadow-md shadow-black/10 transition-opacity hover:opacity-90 sm:w-auto"
        >
          {continueLabel}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
