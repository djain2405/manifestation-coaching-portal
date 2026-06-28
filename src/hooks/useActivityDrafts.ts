"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityDraft } from "@/lib/types";
import {
  getActivityResponses,
  saveActivityResponse,
} from "@/app/actions/progress";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const STORAGE_PREFIX = "night-school:drafts:";

function storageKey(collectionSlug: string, itemSlug: string) {
  return `${STORAGE_PREFIX}${collectionSlug}:${itemSlug}`;
}

function readLocal(collectionSlug: string, itemSlug: string): ActivityDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(collectionSlug, itemSlug));
    if (!raw) return {};
    return JSON.parse(raw) as ActivityDraft;
  } catch {
    return {};
  }
}

function writeLocal(
  collectionSlug: string,
  itemSlug: string,
  draft: ActivityDraft,
) {
  localStorage.setItem(
    storageKey(collectionSlug, itemSlug),
    JSON.stringify(draft),
  );
}

export function useActivityDrafts(
  collectionSlug: string,
  itemSlug: string,
  itemId?: string,
) {
  const useServer = isSupabaseConfigured() && Boolean(itemId);

  const [draft, setDraft] = useState<ActivityDraft>({});
  const [hydrated, setHydrated] = useState(false);
  const [savedHint, setSavedHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (useServer && itemId) {
        const local = readLocal(collectionSlug, itemSlug);
        const server = await getActivityResponses(itemId);

        if (Object.keys(local).length > 0 && Object.keys(server).length === 0) {
          for (const [key, val] of Object.entries(local)) {
            await saveActivityResponse(itemId, key, val);
          }
          localStorage.removeItem(storageKey(collectionSlug, itemSlug));
          const merged = await getActivityResponses(itemId);
          if (!cancelled) setDraft(merged);
        } else if (!cancelled) {
          setDraft(server);
        }
      } else if (!cancelled) {
        setDraft(readLocal(collectionSlug, itemSlug));
      }
      if (!cancelled) setHydrated(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [collectionSlug, itemSlug, itemId, useServer]);

  const persist = useCallback(
    (next: ActivityDraft) => {
      setDraft(next);
      if (useServer && itemId) {
        // Individual fields saved via setField
      } else {
        writeLocal(collectionSlug, itemSlug, next);
      }
      setSavedHint(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSavedHint(false), 2000);
    },
    [collectionSlug, itemSlug, itemId, useServer],
  );

  const setField = useCallback(
    (promptId: string, value: string | boolean) => {
      const current = useServer ? draft : readLocal(collectionSlug, itemSlug);
      const next = { ...current, [promptId]: value };
      persist(next);
      if (useServer && itemId) {
        void saveActivityResponse(itemId, promptId, value);
      }
    },
    [collectionSlug, itemSlug, draft, itemId, persist, useServer],
  );

  return {
    draft,
    hydrated,
    savedHint,
    setField,
  };
}
