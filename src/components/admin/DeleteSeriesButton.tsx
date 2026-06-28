"use client";

import { useTransition } from "react";
import { deleteCollectionAction } from "@/app/admin/actions";

type Props = {
  collectionId: string;
  title: string;
  lessonCount: number;
  variant?: "inline" | "panel";
};

export function DeleteSeriesButton({
  collectionId,
  title,
  lessonCount,
  variant = "inline",
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const message =
      lessonCount > 0
        ? `Delete "${title}" and all ${lessonCount} lessons? This cannot be undone.`
        : `Delete "${title}"? This cannot be undone.`;

    if (!window.confirm(message)) return;

    startTransition(async () => {
      await deleteCollectionAction(collectionId);
    });
  }

  if (variant === "panel") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="font-display text-xl text-foreground">Delete series</h2>
        <p className="mt-1 text-sm text-muted">
          Permanently remove this series and every lesson inside it.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="mt-4 min-h-10 rounded-lg border border-red-300 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Delete series"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-border px-3 py-2 text-sm text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
