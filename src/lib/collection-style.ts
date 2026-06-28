import type { CSSProperties } from "react";
import type { Collection } from "./types";

export function getCollectionStyle(collection: Collection): CSSProperties {
  const accent = collection.accent ?? "#163832";
  return {
    ["--accent" as string]: accent,
    ["--accent-glow" as string]: `color-mix(in srgb, ${accent} 35%, transparent)`,
  };
}

export function getCoverClassName(collection: Collection): string {
  return collection.cover?.gradient ?? "from-surface via-surface-elevated to-background";
}
