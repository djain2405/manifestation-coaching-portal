"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  updateWatchItemAction,
  updateActivityItemAction,
} from "@/app/admin/actions";
import { isActivityItem } from "@/lib/items";
import { embedToPasteUrl } from "@/lib/parse-video-url";
import type { Item } from "@/lib/types";

type Props = {
  item: Item;
  collectionId: string;
  onCancel: () => void;
};

export function EditItemForm({ item, collectionId, onCancel }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      if (isActivityItem(item)) {
        await updateActivityItemAction(item.id!, collectionId, fd);
      } else {
        await updateWatchItemAction(item.id!, collectionId, fd);
      }
      router.refresh();
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-border pt-3">
      <input
        name="title"
        defaultValue={item.title}
        placeholder="Lesson title"
        required
        className="w-full min-h-10 rounded-lg border border-border px-3 text-sm"
      />
      {!isActivityItem(item) ? (
        <input
          name="url"
          type="url"
          defaultValue={item.embed ? embedToPasteUrl(item.embed) : ""}
          placeholder="YouTube or Loom URL"
          required
          className="w-full min-h-10 rounded-lg border border-border px-3 text-sm"
        />
      ) : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="min-h-10 rounded-lg border border-border px-4 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
