import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getAllCollectionsForAdmin } from "@/lib/curriculum";
import { createCollectionAction } from "@/app/admin/actions";
import { DeleteSeriesButton } from "@/components/admin/DeleteSeriesButton";

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
        <button
          type="submit"
          className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-foreground"
        >
          Add series
        </button>
      </form>

      <ul className="space-y-3">
        {collections.map((c) => (
          <li
            key={c.id ?? c.slug}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5"
          >
            <Link
              href={`/admin/series/${c.id}`}
              className="min-w-0 flex-1 hover:opacity-90"
            >
              <h2 className="font-display text-xl text-foreground">{c.title}</h2>
              <p className="text-sm text-muted">
                {c.items.length} lessons · /course/{c.slug}
              </p>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/series/${c.id}`}
                className="rounded-lg border border-border px-3 py-2 text-sm text-accent"
              >
                Edit
              </Link>
              {c.id ? (
                <DeleteSeriesButton
                  collectionId={c.id}
                  title={c.title}
                  lessonCount={c.items.length}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
