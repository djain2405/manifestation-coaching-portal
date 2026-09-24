"use client";

import Link from "next/link";
import type { Collection } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { isLightCover } from "@/lib/collection-style";
import { ProgressBar } from "./ProgressBar";
import { HeroOrnament } from "./Ornaments";

type Props = {
  collection: Collection;
  labels: SiteLabels;
  coverClass: string;
  continueHref: string;
  continueLabel: string;
  percent: number;
  completedCount: number;
  hydrated: boolean;
  greeting?: string | null;
  progressSummary: string;
  isFirstRun: boolean;
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
  greeting,
  progressSummary,
  isFirstRun,
}: Props) {
  const total = collection.items.length;
  const lightCover = isLightCover(coverClass);

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br ${coverClass} p-8 sm:p-10`}
    >
      <HeroOrnament light={lightCover} />
      <div className="relative z-10 max-w-2xl space-y-6">
        {greeting ? (
          <p
            className={`text-base font-medium ${lightCover ? "text-foreground/90" : "text-white/90"}`}
          >
            {greeting}
          </p>
        ) : null}
        <div className="space-y-3">
          <p
            className={`text-xs font-medium uppercase tracking-[0.1em] ${lightCover ? "text-muted" : "text-white/70"}`}
          >
            {hydrated && isFirstRun ? labels.startHere : labels.collection}
          </p>
          <h1
            className={`font-display text-4xl leading-[1.08] sm:text-5xl ${lightCover ? "text-foreground" : "text-white"}`}
          >
            {collection.title}
          </h1>
          <p className={`text-lg ${lightCover ? "text-muted" : "text-white/80"}`}>
            {collection.description}
          </p>
        </div>

        {hydrated ? (
          isFirstRun ? null : (
            <div className="space-y-3">
              <p
                className={`text-lg font-medium ${lightCover ? "text-foreground" : "text-white"}`}
              >
                {progressSummary}
              </p>
              <ProgressBar
                percent={percent}
                completedCount={completedCount}
                total={total}
                progressLabel={labels.progress ?? "finished"}
                onDark={!lightCover}
              />
            </div>
          )
        ) : (
          <div
            className={`h-10 animate-pulse rounded-lg ${lightCover ? "bg-foreground/10" : "bg-white/10"}`}
            aria-hidden
          />
        )}

        <Link
          href={continueHref}
          prefetch={false}
          className={`inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg px-8 py-4 text-lg font-semibold shadow-md shadow-black/10 transition-opacity hover:opacity-90 sm:w-auto ${
            lightCover
              ? "bg-accent text-accent-foreground"
              : "bg-white text-accent"
          }`}
        >
          {continueLabel}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
