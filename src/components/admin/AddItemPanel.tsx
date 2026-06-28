"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createWatchItemAction,
  createActivityItemAction,
} from "@/app/admin/actions";
import { parseVideoUrl } from "@/lib/parse-video-url";
import { LoomPicker } from "./LoomPicker";

type Props = {
  collectionId: string;
};

export function AddItemPanel({ collectionId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"loom" | "paste" | "activity">("paste");
  const [pending, setPending] = useState(false);

  async function addWatch(embedProvider: string, embedId: string, title: string) {
    setPending(true);
    try {
      await createWatchItemAction(collectionId, {
        title,
        embedProvider,
        embedId,
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function addActivity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createActivityItemAction(collectionId, {
        title: String(fd.get("title")),
      });
      e.currentTarget.reset();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="mb-4 font-display text-xl text-foreground">Add lesson</h3>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["loom", "paste", "activity"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-10 rounded-lg px-4 text-sm font-medium ${
              tab === t
                ? "bg-accent text-accent-foreground"
                : "border border-border"
            }`}
          >
            {t === "loom" ? "Pick from Loom" : t === "paste" ? "Paste link" : "Worksheet"}
          </button>
        ))}
      </div>

      {tab === "loom" ? (
        <LoomPicker
          disabled={pending}
          onSelect={(video) => addWatch("loom", video.id, video.title)}
        />
      ) : null}

      {tab === "paste" ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const url = String(fd.get("url"));
            const title = String(fd.get("title") || "Video");
            const parsed = parseVideoUrl(url);
            if (parsed) await addWatch(parsed.provider, parsed.id, title);
          }}
          className="space-y-3"
        >
          <input
            name="title"
            placeholder="Lesson title"
            required
            className="w-full min-h-12 rounded-xl border border-border px-4"
          />
          <input
            name="url"
            placeholder="Loom or YouTube URL"
            required
            className="w-full min-h-12 rounded-xl border border-border px-4"
          />
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-foreground"
          >
            Add video
          </button>
        </form>
      ) : null}

      {tab === "activity" ? (
        <form onSubmit={addActivity} className="space-y-3">
          <input
            name="title"
            placeholder="Worksheet title"
            required
            className="w-full min-h-12 rounded-xl border border-border px-4"
          />
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-foreground"
          >
            Add worksheet
          </button>
        </form>
      ) : null}
    </div>
  );
}
