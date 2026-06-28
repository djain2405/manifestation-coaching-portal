import type { Item, ItemType } from "./types";

export function getItemType(item: Item): ItemType {
  if (item.type) return item.type;
  return item.activity ? "activity" : "watch";
}

export function isWatchItem(item: Item): boolean {
  return getItemType(item) === "watch";
}

export function isActivityItem(item: Item): boolean {
  return getItemType(item) === "activity";
}

export function getItemDuration(item: Item): number | undefined {
  if (isActivityItem(item)) {
    return item.activity?.estimatedMinutes;
  }
  return item.durationMinutes;
}
