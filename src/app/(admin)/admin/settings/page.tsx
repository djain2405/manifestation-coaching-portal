import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { updateSiteSettingsAction } from "@/app/admin/actions";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  const photoUrl = typeof settings?.coach_photo_url === "string"
    ? settings.coach_photo_url
    : "";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Site settings</h1>
          <p className="text-muted">
            Title, tagline, and the coach presence clients see on login and welcome.
          </p>
        </div>
        <Link href="/admin" className="text-accent underline">
          ← Admin
        </Link>
      </div>

      <form
        action={updateSiteSettingsAction}
        className="max-w-xl space-y-6 rounded-2xl border border-border bg-white p-6"
      >
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-accent">
            Brand
          </p>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Site title</span>
            <input
              name="title"
              defaultValue={settings?.title ?? "Manifest Portal"}
              className="w-full min-h-12 rounded-xl border border-border px-4"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Tagline</span>
            <input
              name="tagline"
              defaultValue={settings?.tagline ?? ""}
              className="w-full min-h-12 rounded-xl border border-border px-4"
            />
          </label>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-accent">
            Coach presence
          </p>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Your name</span>
            <input
              name="coachName"
              defaultValue={settings?.coach_name ?? ""}
              placeholder="Shown on login, signup, and welcome"
              className="w-full min-h-12 rounded-xl border border-border px-4"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Welcome message</span>
            <textarea
              name="welcomeMessage"
              rows={4}
              defaultValue={settings?.welcome_message ?? ""}
              placeholder="A few sentences for a client’s first visit."
              className="w-full rounded-xl border border-border px-4 py-3"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Photo URL</span>
            <input
              name="coachPhotoUrl"
              defaultValue={photoUrl}
              placeholder="https://…"
              className="w-full min-h-12 rounded-xl border border-border px-4"
            />
            <span className="text-sm text-muted">
              Optional. Leave blank to use the brand mark instead.
            </span>
          </label>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-1 ring-border"
            />
          ) : null}
          <label className="block space-y-1">
            <span className="text-sm font-medium">Help line</span>
            <input
              name="contactLine"
              defaultValue={settings?.contact_line ?? ""}
              placeholder="Message Divya if you need help."
              className="w-full min-h-12 rounded-xl border border-border px-4"
            />
            <span className="text-sm text-muted">
              Used on login and signup errors instead of “contact the host.”
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-foreground"
        >
          Save
        </button>
      </form>
    </div>
  );
}
