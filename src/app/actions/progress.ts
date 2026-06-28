"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ActivityDraft } from "@/lib/types";

export async function fetchProgressForCollection(
  items: Array<{ id?: string; slug: string }>,
): Promise<{ completedSlugs: string[]; lastSlug: string | null }> {
  if (!isSupabaseConfigured()) {
    return { completedSlugs: [], lastSlug: null };
  }

  const ids = items.map((i) => i.id).filter(Boolean) as string[];
  if (ids.length === 0) return { completedSlugs: [], lastSlug: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { completedSlugs: [], lastSlug: null };

  const { data: rows } = await supabase
    .from("user_item_progress")
    .select("item_id, completed_at, last_opened_at")
    .eq("user_id", user.id)
    .in("item_id", ids);

  const idToSlug = new Map(
    items.filter((i) => i.id).map((i) => [i.id!, i.slug]),
  );

  const completedSlugs: string[] = [];
  let lastSlug: string | null = null;
  let lastOpened: string | null = null;

  for (const row of rows ?? []) {
    const slug = idToSlug.get(row.item_id);
    if (!slug) continue;
    if (row.completed_at) completedSlugs.push(slug);
    if (
      row.last_opened_at &&
      (!lastOpened || row.last_opened_at > lastOpened)
    ) {
      lastOpened = row.last_opened_at;
      lastSlug = slug;
    }
  }

  return { completedSlugs, lastSlug };
}

export async function setItemOpened(itemId: string) {
  if (!isSupabaseConfigured() || !itemId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_item_progress").upsert(
    {
      user_id: user.id,
      item_id: itemId,
      last_opened_at: new Date().toISOString(),
    },
    { onConflict: "user_id,item_id" },
  );
}

export async function setItemCompleted(itemId: string, completed: boolean) {
  if (!isSupabaseConfigured() || !itemId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_item_progress").upsert(
    {
      user_id: user.id,
      item_id: itemId,
      completed_at: completed ? new Date().toISOString() : null,
      last_opened_at: new Date().toISOString(),
    },
    { onConflict: "user_id,item_id" },
  );
}

export async function getActivityResponses(
  itemId: string,
): Promise<ActivityDraft> {
  if (!isSupabaseConfigured() || !itemId) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data: rows } = await supabase
    .from("activity_responses")
    .select("prompt_key, value")
    .eq("user_id", user.id)
    .eq("item_id", itemId);

  const draft: ActivityDraft = {};
  for (const row of rows ?? []) {
    if (row.value === "true") draft[row.prompt_key] = true;
    else if (row.value === "false") draft[row.prompt_key] = false;
    else draft[row.prompt_key] = row.value;
  }
  return draft;
}

export async function saveActivityResponse(
  itemId: string,
  promptKey: string,
  value: string | boolean,
) {
  if (!isSupabaseConfigured() || !itemId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_responses").upsert(
    {
      user_id: user.id,
      item_id: itemId,
      prompt_key: promptKey,
      value: String(value),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,item_id,prompt_key" },
  );
}
