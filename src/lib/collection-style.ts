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

const LIGHT_LUMINANCE = 0.62;

function channelLuminance(hex: string): number | null {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function isLightHex(color: string): boolean {
  const luminance = channelLuminance(color);
  if (luminance === null) return true;
  return luminance > LIGHT_LUMINANCE;
}

export function isLightAccent(accent: string | undefined): boolean {
  if (!accent) return false;
  return isLightHex(accent);
}

export function isLightCover(gradient: string | undefined): boolean {
  if (!gradient) return true;
  const hexes = gradient.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g);
  if (!hexes || hexes.length === 0) return true;
  const luminances = hexes
    .map((hex) => channelLuminance(hex))
    .filter((value): value is number => value !== null);
  if (luminances.length === 0) return true;
  const average =
    luminances.reduce((sum, value) => sum + value, 0) / luminances.length;
  return average > LIGHT_LUMINANCE;
}
