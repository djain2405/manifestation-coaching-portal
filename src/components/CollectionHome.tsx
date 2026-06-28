"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Collection } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";
import { formatLabel } from "@/lib/labels";
import { CollectionHero } from "./CollectionHero";
import { LessonList } from "./LessonList";

type Props = {
  collection: Collection;
  labels: SiteLabels;
  coverClass: string;
};

export function CollectionHome({ collection, labels, coverClass }: Props) {
  const items = collection.items;
  const { percent, completedCount, continueLessonSlug, continueItem, hydrated, isComplete } =
    useProgress(collection.slug, items);

  const continueHref = continueLessonSlug
    ? `/course/${collection.slug}/${continueLessonSlug}`
    : `/course/${collection.slug}/${items[0]?.slug ?? ""}`;

  const continueLabel =
    continueItem?.title
      ? `${labels.continueLesson ?? "Continue"}: ${continueItem.title}`
      : (labels.continue ?? "Pick up where you left off");

  const [welcomeLine, setWelcomeLine] = useState<string | null>(null);

  useEffect(() => {
    const key = `night-school:welcome:${collection.slug}`;
    const last = sessionStorage.getItem(key);
    const now = Date.now();
    if (last && now - Number(last) < 1000 * 60 * 60 * 24 * 7 && continueItem) {
      setWelcomeLine(
        `${labels.welcomeBack} — ${labels.continueLesson}: “${continueItem.title}”`,
      );
    }
    sessionStorage.setItem(key, String(now));
  }, [collection.slug, continueItem, labels.welcomeBack, labels.continueLesson]);

  const progressSummary = formatLabel(
    labels.lessonsFinished ?? "You've finished {done} of {total} lessons",
    {
      done: completedCount,
      total: items.length,
    },
  );

  return (
    <div className="space-y-12">
      <CollectionHero
        collection={collection}
        labels={labels}
        coverClass={coverClass}
        continueHref={continueHref}
        continueLabel={continueLabel}
        percent={percent}
        completedCount={completedCount}
        hydrated={hydrated}
        welcomeLine={welcomeLine}
        progressSummary={progressSummary}
      />

      <section>
        <h2 className="mb-4 font-display text-2xl text-foreground">
          {labels.allItems}
        </h2>
        <LessonList
          collectionSlug={collection.slug}
          items={items}
          labels={labels}
          isComplete={isComplete}
          hydrated={hydrated}
          activeSlug={continueLessonSlug ?? undefined}
        />
      </section>
    </div>
  );
}
