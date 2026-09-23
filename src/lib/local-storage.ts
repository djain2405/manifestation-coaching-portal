const LEGACY_PREFIX = "night-school:";
const STORAGE_PREFIX = "manifest-portal:";

export function progressStorageKey(collectionSlug: string) {
  return `${STORAGE_PREFIX}progress:${collectionSlug}`;
}

export function legacyProgressStorageKey(collectionSlug: string) {
  return `${LEGACY_PREFIX}progress:${collectionSlug}`;
}

export function draftStorageKey(collectionSlug: string, itemSlug: string) {
  return `${STORAGE_PREFIX}drafts:${collectionSlug}:${itemSlug}`;
}

export function legacyDraftStorageKey(collectionSlug: string, itemSlug: string) {
  return `${LEGACY_PREFIX}drafts:${collectionSlug}:${itemSlug}`;
}

export function readMigratedStorage(newKey: string, oldKey: string): string | null {
  if (typeof window === "undefined") return null;
  const current = window.localStorage.getItem(newKey);
  if (current != null) return current;
  const legacy = window.localStorage.getItem(oldKey);
  if (legacy != null) {
    window.localStorage.setItem(newKey, legacy);
    window.localStorage.removeItem(oldKey);
    return legacy;
  }
  return null;
}

export function writeStorage(key: string, value: string) {
  window.localStorage.setItem(key, value);
}

export function removeStorage(key: string) {
  window.localStorage.removeItem(key);
}
