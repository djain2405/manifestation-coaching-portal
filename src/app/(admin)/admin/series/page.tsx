import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getAllCollectionsForAdmin } from "@/lib/curriculum";
import { createCollectionAction } from "@/app/admin/actions";

export default async function AdminSeriesPage() {
  await requireAdmin();
  const collections = await getAllCollectionsForAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Series</h1>
          <p className="text-muted">Create and edit learning series.</p>
        </div>
        <Link href="/admin" className="text-accent underline">
          ← Admin
        </Link>
      </div>

      <form action={createCollectionAction} className="flex flex-wrap gap-3 rounded-2xl border border-border bg-white p-6">
        <input
          name="title"
          placeholder="New series title"
          required
          className="min-h-12 flex-1 rounded-xl border border-border px-4 text-base"
        />
        <input
          name="slug"
          placeholder="url-slug"
          required
          className="min-h-12 w-40 rounded-xl border border-border px-4 text-base"
        />
        <button
          type="submit"
          className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-foreground"
        >
          Add series
        </button>
      </form>

      <ul className="space-y-3">
        {collections.map((c) => (
          <li key={c.id ?? c.slug}>
            <Link
              href={`/admin/series/${c.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 hover:border-accent/40"
            >
              <div>
                <h2 className="font-display text-xl text-foreground">{c.title}</h2>
                <p className="text-sm text-muted">
                  {c.items.length} lessons · /course/{c.slug}
                </p>
              </div>
              <span className="text-accent">Edit →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
