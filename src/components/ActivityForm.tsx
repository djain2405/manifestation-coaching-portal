"use client";

import type { ActivityContent } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { useActivityDrafts } from "@/hooks/useActivityDrafts";

type Props = {
  collectionSlug: string;
  itemSlug: string;
  itemId?: string;
  activity: ActivityContent;
  labels: SiteLabels;
};

export function ActivityForm({
  collectionSlug,
  itemSlug,
  itemId,
  activity,
  labels,
}: Props) {
  const { draft, hydrated, savedHint, setField } = useActivityDrafts(
    collectionSlug,
    itemSlug,
    itemId,
  );

  if (!hydrated) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 rounded-xl bg-surface-elevated" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-xl text-foreground sm:text-2xl">
          {labels.writeNotes ?? labels.yourNotes}
        </h2>
        <p className="text-base text-muted">{labels.notesAutoSave}</p>
        {savedHint ? (
          <span className="text-sm font-medium text-accent" role="status">
            {labels.savedLocally} ✓
          </span>
        ) : null}
      </div>

      <div className="space-y-5">
        {activity.prompts.length === 0 ? (
          <textarea
            id="worksheet-notes"
            rows={8}
            value={typeof draft.notes === "string" ? draft.notes : ""}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder={labels.writeNotes ?? "Write your notes here…"}
            className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        ) : (
          activity.prompts.map((prompt) => {
          const value = draft[prompt.id];

          if (prompt.kind === "checkbox") {
            return (
              <label
                key={prompt.id}
                className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 hover:border-accent/30"
              >
                <input
                  type="checkbox"
                  checked={value === true}
                  onChange={(e) => setField(prompt.id, e.target.checked)}
                  className="mt-1.5 h-5 w-5 rounded border-border accent-accent"
                />
                <span className="text-base text-foreground">{prompt.label}</span>
              </label>
            );
          }

          if (prompt.kind === "longtext") {
            return (
              <div key={prompt.id} className="space-y-2">
                <label
                  htmlFor={prompt.id}
                  className="block text-base font-medium text-foreground"
                >
                  {prompt.label}
                </label>
                <textarea
                  id={prompt.id}
                  rows={5}
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => setField(prompt.id, e.target.value)}
                  placeholder={prompt.placeholder}
                  className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                />
              </div>
            );
          }

          return (
            <div key={prompt.id} className="space-y-2">
              <label
                htmlFor={prompt.id}
                className="block text-base font-medium text-foreground"
              >
                {prompt.label}
              </label>
              <input
                id={prompt.id}
                type="text"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => setField(prompt.id, e.target.value)}
                placeholder={prompt.placeholder}
                className="w-full min-h-12 rounded-xl border border-border bg-background px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
