"use client";

import { useEffect, useState } from "react";

type LoomVideo = {
  id: string;
  title: string;
  duration?: number;
  thumbnailUrl?: string;
};

type Props = {
  onSelect: (video: LoomVideo) => void;
  disabled?: boolean;
};

export function LoomPicker({ onSelect, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<LoomVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/loom/videos?query=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) setVideos(data.videos ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load Loom videos");
          setVideos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your Loom videos…"
        className="w-full min-h-12 rounded-xl border border-border px-4"
      />
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}
      {loading ? <p className="text-sm text-muted">Loading…</p> : null}
      <ul className="max-h-80 space-y-2 overflow-y-auto">
        {videos.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(v)}
              className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-accent/40 disabled:opacity-50"
            >
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.thumbnailUrl}
                  alt=""
                  className="h-12 w-20 rounded object-cover"
                />
              ) : (
                <span className="flex h-12 w-20 items-center justify-center rounded bg-surface text-sm">
                  ▶
                </span>
              )}
              <span className="flex-1 font-medium text-foreground">{v.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
