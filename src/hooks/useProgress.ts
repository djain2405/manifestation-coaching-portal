"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CourseProgress } from "@/lib/types";
import {
  fetchProgressForCollection,
  setItemCompleted,
  setItemOpened,
} from "@/app/actions/progress";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const STORAGE_PREFIX = "night-school:progress:";

function storageKey(courseSlug: string) {
  return `${STORAGE_PREFIX}${courseSlug}`;
}

function readLocal(courseSlug: string): CourseProgress {
  if (typeof window === "undefined") {
    return { completed: [], lastLesson: null };
  }
  try {
    const raw = localStorage.getItem(storageKey(courseSlug));
    if (!raw) return { completed: [], lastLesson: null };
    const parsed = JSON.parse(raw) as CourseProgress;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      lastLesson:
        typeof parsed.lastLesson === "string" ? parsed.lastLesson : null,
    };
  } catch {
    return { completed: [], lastLesson: null };
  }
}

function writeLocal(courseSlug: string, progress: CourseProgress) {
  localStorage.setItem(storageKey(courseSlug), JSON.stringify(progress));
}

type ItemRef = { id?: string; slug: string; title?: string };

export function useProgress(collectionSlug: string, items: ItemRef[]) {
  const itemSlugs = items.map((i) => i.slug);
  const slugToIdRef = useRef(new Map<string, string>());
  slugToIdRef.current = new Map(
    items.filter((i) => i.id).map((i) => [i.slug, i.id!]),
  );
  const useServer = isSupabaseConfigured() && items.some((i) => i.id);

  const [progress, setProgress] = useState<CourseProgress>({
    completed: [],
    lastLesson: null,
  });
  const [hydrated, setHydrated] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const itemsKey = items.map((i) => `${i.id ?? ""}:${i.slug}`).join(",");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (useServer) {
        const local = readLocal(collectionSlug);
        const server = await fetchProgressForCollection(items);

        if (local.completed.length > 0 && server.completedSlugs.length === 0) {
          for (const slug of local.completed) {
            const id = slugToIdRef.current.get(slug);
            if (id) await setItemCompleted(id, true);
          }
          if (local.lastLesson) {
            const id = slugToIdRef.current.get(local.lastLesson);
            if (id) await setItemOpened(id);
          }
          localStorage.removeItem(storageKey(collectionSlug));
          const merged = await fetchProgressForCollection(items);
          if (!cancelled) {
            setProgress({
              completed: merged.completedSlugs,
              lastLesson: merged.lastSlug,
            });
          }
        } else if (!cancelled) {
          setProgress({
            completed: server.completedSlugs,
            lastLesson: server.lastSlug,
          });
        }
      } else if (!cancelled) {
        setProgress(readLocal(collectionSlug));
      }
      if (!cancelled) setHydrated(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [collectionSlug, itemsKey, useServer]);

  const persistLocal = useCallback(
    (next: CourseProgress) => {
      setProgress(next);
      writeLocal(collectionSlug, next);
    },
    [collectionSlug],
  );

  const setLastLesson = useCallback(
    (lessonSlug: string) => {
      if (progressRef.current.lastLesson === lessonSlug) return;

      if (useServer) {
        const id = slugToIdRef.current.get(lessonSlug);
        if (id) void setItemOpened(id);
        setProgress((p) => ({ ...p, lastLesson: lessonSlug }));
        return;
      }
      const current = readLocal(collectionSlug);
      if (current.lastLesson === lessonSlug) return;
      persistLocal({ ...current, lastLesson: lessonSlug });
    },
    [collectionSlug, persistLocal, useServer],
  );

  const markComplete = useCallback(
    (lessonSlug: string) => {
      if (useServer) {
        const id = slugToIdRef.current.get(lessonSlug);
        if (id) void setItemCompleted(id, true);
        setProgress((p) => ({
          completed: p.completed.includes(lessonSlug)
            ? p.completed
            : [...p.completed, lessonSlug],
          lastLesson: lessonSlug,
        }));
        return;
      }
      const current = readLocal(collectionSlug);
      if (current.completed.includes(lessonSlug)) return;
      persistLocal({
        ...current,
        completed: [...current.completed, lessonSlug],
        lastLesson: lessonSlug,
      });
    },
    [collectionSlug, persistLocal, useServer],
  );

  const toggleComplete = useCallback(
    (lessonSlug: string) => {
      if (useServer) {
        const id = slugToIdRef.current.get(lessonSlug);
        const isDone = progress.completed.includes(lessonSlug);
        if (id) void setItemCompleted(id, !isDone);
        setProgress((p) => ({
          completed: isDone
            ? p.completed.filter((s) => s !== lessonSlug)
            : [...p.completed, lessonSlug],
          lastLesson: lessonSlug,
        }));
        return;
      }
      const current = readLocal(collectionSlug);
      const isDone = current.completed.includes(lessonSlug);
      const completed = isDone
        ? current.completed.filter((s) => s !== lessonSlug)
        : [...current.completed, lessonSlug];
      persistLocal({ completed, lastLesson: lessonSlug });
    },
    [collectionSlug, persistLocal, progress.completed, useServer],
  );

  const completedCount = progress.completed.filter((s) =>
    itemSlugs.includes(s),
  ).length;

  const percent =
    itemSlugs.length === 0
      ? 0
      : Math.round((completedCount / itemSlugs.length) * 100);

  const continueLessonSlug = (() => {
    if (progress.lastLesson && itemSlugs.includes(progress.lastLesson)) {
      const lastIndex = itemSlugs.indexOf(progress.lastLesson);
      const nextIncomplete = itemSlugs.find(
        (slug, i) => i > lastIndex && !progress.completed.includes(slug),
      );
      if (nextIncomplete) return nextIncomplete;
      if (!progress.completed.includes(progress.lastLesson)) {
        return progress.lastLesson;
      }
    }
    return (
      itemSlugs.find((slug) => !progress.completed.includes(slug)) ??
      itemSlugs[0] ??
      null
    );
  })();

  const continueItem = items.find((i) => i.slug === continueLessonSlug);

  return {
    progress,
    hydrated,
    percent,
    completedCount,
    markComplete,
    toggleComplete,
    setLastLesson,
    continueLessonSlug,
    continueItem,
    isComplete: (slug: string) => progress.completed.includes(slug),
  };
}
