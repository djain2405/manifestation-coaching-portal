#!/usr/bin/env node
/**
 * Seed Supabase from content/curriculum.json
 * Usage: npm run seed
 * Loads .env.local automatically (Next.js does not load it for standalone scripts).
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import ws from "ws";

function loadEnvFile(filename) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing Supabase env vars. Add to .env.local in the project root:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=your-secret-or-service_role-key\n\n" +
      "Note: npm run seed does not use Next.js — the seed script loads .env.local for you.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

async function main() {
  const jsonPath = join(process.cwd(), "content/curriculum.json");
  const raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
  const site = raw.site;
  const collections = raw.collections ?? raw.courses ?? [];

  await supabase.from("site_settings").upsert({
    id: "default",
    title: site.title,
    tagline: site.tagline,
    password_hint: site.passwordHint ?? "",
    theme: site.theme ?? "light",
    labels: site.labels ?? {},
    updated_at: new Date().toISOString(),
  });

  for (let ci = 0; ci < collections.length; ci++) {
    const col = collections[ci];
    const { data: collection, error: colErr } = await supabase
      .from("collections")
      .upsert(
        {
          slug: col.slug,
          title: col.title,
          description: col.description,
          accent: col.accent ?? "#163832",
          cover_gradient: col.cover?.gradient ?? null,
          sort_order: ci,
          published: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (colErr || !collection) {
      console.error("Collection error:", colErr);
      continue;
    }

    const items = col.items ?? col.lessons ?? [];
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii];
      const type =
        item.type ??
        (item.activity ? "activity" : item.embed ? "watch" : "watch");

      const { data: row, error: itemErr } = await supabase
        .from("items")
        .upsert(
          {
            collection_id: collection.id,
            slug: item.slug,
            type,
            title: item.title,
            subtitle: item.subtitle ?? null,
            emoji: item.emoji ?? null,
            description: item.description,
            highlight: item.highlight ?? null,
            sort_order: ii,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "collection_id,slug" },
        )
        .select("id")
        .single();

      if (itemErr || !row) {
        console.error("Item error:", itemErr);
        continue;
      }

      if (type === "watch") {
        await supabase.from("watch_items").upsert({
          item_id: row.id,
          embed_provider: item.embed?.provider ?? "youtube",
          embed_id: item.embed?.id ?? "pending",
          duration_minutes: item.durationMinutes ?? null,
        });
      }

      if (type === "activity") {
        await supabase.from("activity_items").upsert({
          item_id: row.id,
          intro: item.activity?.intro ?? null,
          pdf_path: item.activity?.pdf ?? null,
          pdf_label: item.activity?.pdfLabel ?? null,
          estimated_minutes: item.activity?.estimatedMinutes ?? null,
        });

        const prompts = item.activity?.prompts ?? [];
        for (let pi = 0; pi < prompts.length; pi++) {
          const p = prompts[pi];
          await supabase.from("activity_prompts").upsert(
            {
              item_id: row.id,
              prompt_key: p.id,
              label: p.label,
              kind: p.kind,
              placeholder: p.placeholder ?? null,
              sort_order: pi,
            },
            { onConflict: "item_id,prompt_key" },
          );
        }
      }
    }

    console.log(`Seeded collection: ${col.slug}`);
  }

  const token = randomBytes(24).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const { error: inviteError } = await supabase.from("invites").insert({
    token,
    expires_at: expires.toISOString(),
  });

  if (inviteError) {
    console.error("\nFailed to create invite:", inviteError.message);
    console.error(
      "Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  console.log("\nBootstrap invite link (share with first user):");
  console.log(`  /signup?invite=${token}`);
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
