"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseVideoUrl } from "@/lib/parse-video-url";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function uniqueItemSlug(
  supabase: SupabaseClient,
  collectionId: string,
  title: string,
  fallback: string,
) {
  const base = slugify(title, fallback);
  const { data } = await supabase
    .from("items")
    .select("slug")
    .eq("collection_id", collectionId);

  const taken = new Set((data ?? []).map((row) => row.slug));
  return uniqueSlug(base, taken);
}

async function uniqueCollectionSlug(
  supabase: SupabaseClient,
  title: string,
) {
  const base = slugify(title, "series");
  const { data } = await supabase.from("collections").select("slug");

  const taken = new Set((data ?? []).map((row) => row.slug));
  return uniqueSlug(base, taken);
}

export async function createInviteAction(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim() || null;
  const days = Number(formData.get("days") ?? 7) || 7;

  const admin = createAdminClient();
  const token = randomBytes(24).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await admin.from("invites").insert({
    token,
    email,
    expires_at: expires.toISOString(),
    created_by: user?.id ?? null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/invites");
  return token;
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "");
  const tagline = String(formData.get("tagline") ?? "");

  const { error } = await supabase.from("site_settings").upsert({
    id: "default",
    title,
    tagline,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function createCollectionAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const slug = await uniqueCollectionSlug(supabase, title);

  const { data, error } = await supabase
    .from("collections")
    .insert({
      title,
      slug,
      description: "",
      published: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/series");
  redirect(`/admin/series/${data.id}`);
}

export async function updateCollectionAction(
  id: string,
  formData: FormData,
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("collections")
    .update({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      accent: String(formData.get("accent") ?? "#163832"),
      cover_gradient: String(formData.get("cover_gradient") ?? ""),
      published: formData.get("published") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/series/${id}`);
  revalidatePath("/admin/series");
}

export async function reorderItemsAction(
  collectionId: string,
  orderedItemIds: string[],
) {
  await requireAdmin();
  const supabase = await createClient();

  for (let i = 0; i < orderedItemIds.length; i++) {
    await supabase
      .from("items")
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq("id", orderedItemIds[i])
      .eq("collection_id", collectionId);
  }

  revalidatePath(`/admin/series/${collectionId}`);
}

export async function createWatchItemAction(
  collectionId: string,
  data: {
    title: string;
    embedProvider: string;
    embedId: string;
    durationMinutes?: number;
  },
) {
  await requireAdmin();
  const supabase = await createClient();
  const slug = await uniqueItemSlug(supabase, collectionId, data.title, "video");

  const { count } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  const { data: item, error } = await supabase
    .from("items")
    .insert({
      collection_id: collectionId,
      slug,
      type: "watch",
      title: data.title,
      description: "",
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("watch_items").insert({
    item_id: item.id,
    embed_provider: data.embedProvider,
    embed_id: data.embedId,
    duration_minutes: data.durationMinutes ?? null,
  });

  revalidatePath(`/admin/series/${collectionId}`);
  return item.id;
}

export async function createActivityItemAction(
  collectionId: string,
  data: { title: string },
) {
  await requireAdmin();
  const supabase = await createClient();
  const slug = await uniqueItemSlug(
    supabase,
    collectionId,
    data.title,
    "worksheet",
  );

  const { count } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  const { data: item, error } = await supabase
    .from("items")
    .insert({
      collection_id: collectionId,
      slug,
      type: "activity",
      title: data.title,
      description: "",
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("activity_items").insert({ item_id: item.id });

  revalidatePath(`/admin/series/${collectionId}`);
  return item.id;
}

export async function deleteItemAction(itemId: string, collectionId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("items").delete().eq("id", itemId);
  revalidatePath(`/admin/series/${collectionId}`);
}

export async function updateWatchItemAction(
  itemId: string,
  collectionId: string,
  formData: FormData,
) {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const parsed = parseVideoUrl(url);
  if (!parsed) throw new Error("Enter a valid YouTube or Loom URL");

  const { error: itemError } = await supabase
    .from("items")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (itemError) throw new Error(itemError.message);

  const { error: watchError } = await supabase
    .from("watch_items")
    .update({
      embed_provider: parsed.provider,
      embed_id: parsed.id,
    })
    .eq("item_id", itemId);

  if (watchError) throw new Error(watchError.message);

  revalidatePath(`/admin/series/${collectionId}`);
}

export async function updateActivityItemAction(
  itemId: string,
  collectionId: string,
  formData: FormData,
) {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const { error } = await supabase
    .from("items")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/series/${collectionId}`);
}

export async function uploadWorksheetAction(
  itemId: string,
  collectionId: string,
  formData: FormData,
): Promise<string> {
  await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a PDF file to upload");
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF files are supported");
  }

  const admin = createAdminClient();
  const path = `${collectionId}/${itemId}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("worksheets")
    .upload(path, buffer, { upsert: true, contentType: "application/pdf" });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes("Bucket not found")
        ? "Storage bucket “worksheets” is missing. Create a public bucket with that name in Supabase."
        : uploadError.message,
    );
  }

  const { data: urlData } = admin.storage.from("worksheets").getPublicUrl(path);
  const pdfUrl = urlData.publicUrl;

  const { error: updateError } = await admin
    .from("activity_items")
    .update({ pdf_path: pdfUrl })
    .eq("item_id", itemId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/admin/series/${collectionId}`);
  return pdfUrl;
}
