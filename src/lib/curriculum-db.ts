import type {
  ActivityContent,
  Collection,
  Curriculum,
  Embed,
  Item,
  Site,
} from "./types";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import curriculumData from "../../content/curriculum.json";
import { getItemType } from "./items";
import type { RawCurriculum } from "./types";

type DbCollection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  accent: string | null;
  cover_gradient: string | null;
  sort_order: number;
  published: boolean;
  items: DbItem[];
};

type DbItem = {
  id: string;
  slug: string;
  type: string;
  title: string;
  subtitle: string | null;
  emoji: string | null;
  description: string;
  highlight: string | null;
  sort_order: number;
  watch_items:
    | {
        embed_provider: string;
        embed_id: string;
        duration_minutes: number | null;
      }
    | {
        embed_provider: string;
        embed_id: string;
        duration_minutes: number | null;
      }[]
    | null;
  activity_items:
    | {
        intro: string | null;
        pdf_path: string | null;
        pdf_label: string | null;
        estimated_minutes: number | null;
      }
    | {
        intro: string | null;
        pdf_path: string | null;
        pdf_label: string | null;
        estimated_minutes: number | null;
      }[]
    | null;
  activity_prompts: Array<{
    prompt_key: string;
    label: string;
    kind: string;
    placeholder: string | null;
    sort_order: number;
  }>;
};

function firstOrNull<T>(val: T | T[] | null | undefined): T | null {
  if (val == null) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

function mapDbItem(row: DbItem): Item {
  const type = row.type as Item["type"];
  const watch = firstOrNull(row.watch_items as DbItem["watch_items"]);
  const activity = firstOrNull(row.activity_items as DbItem["activity_items"]);
  const promptsRaw = row.activity_prompts ?? [];

  const item: Item = {
    id: row.id,
    slug: row.slug,
    type,
    title: row.title,
    description: row.description,
    subtitle: row.subtitle ?? undefined,
    emoji: row.emoji ?? undefined,
    highlight: row.highlight ?? undefined,
  };

  if (watch) {
    item.embed = {
      provider: watch.embed_provider as Embed["provider"],
      id: watch.embed_id,
    };
    item.durationMinutes = watch.duration_minutes ?? undefined;
  }

  if (activity) {
    const prompts = [...promptsRaw]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => ({
        id: p.prompt_key,
        label: p.label,
        kind: p.kind as ActivityContent["prompts"][0]["kind"],
        placeholder: p.placeholder ?? undefined,
      }));

    item.activity = {
      intro: activity.intro ?? undefined,
      pdf: activity.pdf_path ?? undefined,
      pdfLabel: activity.pdf_label ?? undefined,
      estimatedMinutes: activity.estimated_minutes ?? undefined,
      prompts,
    };
  }

  return item;
}

function mapDbCollection(row: DbCollection): Collection {
  const items = [...row.items]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapDbItem);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    accent: row.accent ?? undefined,
    cover: row.cover_gradient
      ? { gradient: row.cover_gradient }
      : undefined,
    items,
  };
}

function normalizeItem(raw: Item): Item {
  const type = getItemType(raw);
  return { ...raw, type };
}

function normalizeCollection(
  raw: NonNullable<RawCurriculum["collections"]>[number],
): Collection {
  const items = (raw.items ?? raw.lessons ?? []).map(normalizeItem);
  return {
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    items,
    accent: raw.accent,
    cover: raw.cover,
  };
}

function getJsonCurriculum(): Curriculum {
  const raw = curriculumData as RawCurriculum;
  const source = raw.collections ?? raw.courses ?? [];
  return {
    site: raw.site,
    collections: source.map(normalizeCollection),
  };
}

export async function getCurriculumAsync(): Promise<Curriculum> {
  if (!isSupabaseConfigured()) {
    return getJsonCurriculum();
  }

  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  const site: Site = settings
    ? {
        title: settings.title,
        tagline: settings.tagline,
        passwordHint: settings.password_hint,
        theme: settings.theme ?? undefined,
        labels: settings.labels ?? undefined,
      }
    : getJsonCurriculum().site;

  const { data: collections, error } = await supabase
    .from("collections")
    .select(
      `
      id, slug, title, description, accent, cover_gradient, sort_order, published,
      items (
        id, slug, type, title, subtitle, emoji, description, highlight, sort_order,
        watch_items ( embed_provider, embed_id, duration_minutes ),
        activity_items ( intro, pdf_path, pdf_label, estimated_minutes ),
        activity_prompts ( prompt_key, label, kind, placeholder, sort_order )
      )
    `,
    )
    .eq("published", true)
    .order("sort_order");

  if (error || !collections?.length) {
    return { site, collections: getJsonCurriculum().collections };
  }

  const sorted = [...collections].sort(
    (a, b) => a.sort_order - b.sort_order,
  ) as unknown as DbCollection[];

  return {
    site,
    collections: sorted.map(mapDbCollection),
  };
}

export async function getCollectionsAsync(): Promise<Collection[]> {
  const { collections } = await getCurriculumAsync();
  return collections;
}

export async function getCollectionAsync(
  slug: string,
): Promise<Collection | undefined> {
  const collections = await getCollectionsAsync();
  return collections.find((c) => c.slug === slug);
}

export async function getItemAsync(
  collectionSlug: string,
  itemSlug: string,
): Promise<
  { collection: Collection; item: Item; index: number } | undefined
> {
  const collection = await getCollectionAsync(collectionSlug);
  if (!collection) return undefined;
  const index = collection.items.findIndex((i) => i.slug === itemSlug);
  if (index === -1) return undefined;
  return { collection, item: collection.items[index], index };
}

export async function getDefaultCollectionAsync(): Promise<Collection> {
  const collections = await getCollectionsAsync();
  if (collections.length === 0) {
    throw new Error("No collections defined");
  }
  return collections[0];
}

export async function getAllCollectionsForAdmin(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select(
      `
      id, slug, title, description, accent, cover_gradient, sort_order, published,
      items (
        id, slug, type, title, subtitle, emoji, description, highlight, sort_order,
        watch_items ( embed_provider, embed_id, duration_minutes ),
        activity_items ( intro, pdf_path, pdf_label, estimated_minutes ),
        activity_prompts ( prompt_key, label, kind, placeholder, sort_order )
      )
    `,
    )
    .order("sort_order");

  if (!collections?.length) return [];
  return (collections as DbCollection[]).map(mapDbCollection);
}
