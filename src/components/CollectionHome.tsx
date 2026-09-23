"use client";

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
  firstName?: string;
  passwordUpdated?: boolean;
};

export function CollectionHome({
  collection,
  labels,
  coverClass,
  firstName,
  passwordUpdated,
}: Props) {
  const items = collection.items;
  const { percent, completedCount, continueLessonSlug, continueItem, hydrated, isComplete } =
    useProgress(collection.slug, items);

  const continueHref = continueLessonSlug
    ? `/course/${collection.slug}/${continueLessonSlug}`
    : `/course/${collection.slug}/${items[0]?.slug ?? ""}`;

  const isFirstRun = hydrated && completedCount === 0;
  const continueLabel = isFirstRun
    ? formatLabel(labels.beginWith ?? "Begin with {title}", {
        title: items[0]?.title ?? "",
      })
    : continueItem?.title
      ? `${labels.continueLesson ?? "Continue"}: ${continueItem.title}`
      : (labels.continue ?? "Pick up where you left off");

  const greeting = !hydrated
    ? null
    : firstName
      ? formatLabel(
          isFirstRun
            ? (labels.welcomeName ?? "Welcome, {name}.")
            : (labels.welcomeBackName ?? "Welcome back, {name}."),
          { name: firstName },
        )
      : isFirstRun
        ? null
        : (labels.welcomeBack ?? "Welcome back");

  const progressSummary = formatLabel(
    labels.lessonsFinished ?? "You've finished {done} of {total} lessons",
    {
      done: completedCount,
      total: items.length,
    },
  );

  return (
    <div className="space-y-12">
      {passwordUpdated ? (
        <p className="text-base text-accent" role="status">
          Your password was updated.
        </p>
      ) : null}
      <CollectionHero
        collection={collection}
        labels={labels}
        coverClass={coverClass}
        continueHref={continueHref}
        continueLabel={hydrated ? continueLabel : (labels.continue ?? "Pick up where you left off")}
        percent={percent}
        completedCount={completedCount}
        hydrated={hydrated}
        greeting={greeting}
        progressSummary={progressSummary}
        isFirstRun={isFirstRun}
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
