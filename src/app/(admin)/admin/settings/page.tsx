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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Site settings</h1>
          <p className="text-muted">Title and tagline shown on login and home.</p>
        </div>
        <Link href="/admin" className="text-accent underline">
          ← Admin
        </Link>
      </div>

      <form
        action={updateSiteSettingsAction}
        className="max-w-xl space-y-4 rounded-2xl border border-border bg-white p-6"
      >
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
