import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getAllCollectionsForAdmin } from "@/lib/curriculum";
import { updateCollectionAction } from "@/app/admin/actions";
import { SeriesItemList } from "@/components/admin/SeriesItemList";
import { AddItemPanel } from "@/components/admin/AddItemPanel";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminSeriesDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const collections = await getAllCollectionsForAdmin();
  const collection = collections.find((c) => c.id === id);
  if (!collection) notFound();

  const updateAction = updateCollectionAction.bind(null, id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/series" className="text-sm text-accent underline">
            ← All series
          </Link>
          <h1 className="font-display text-3xl text-foreground">{collection.title}</h1>
        </div>
      </div>

      <form action={updateAction} className="space-y-4 rounded-2xl border border-border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Title</span>
            <input
              name="title"
              defaultValue={collection.title}
              className="w-full min-h-12 rounded-xl border border-border px-4"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Accent color</span>
            <input
              name="accent"
              defaultValue={collection.accent ?? "#163832"}
              className="w-full min-h-12 rounded-xl border border-border px-4"
            />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Description</span>
          <textarea
            name="description"
            defaultValue={collection.description}
            rows={3}
            className="w-full rounded-xl border border-border px-4 py-3"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Cover gradient (Tailwind classes)</span>
          <input
            name="cover_gradient"
            defaultValue={collection.cover?.gradient ?? ""}
            className="w-full min-h-12 rounded-xl border border-border px-4"
          />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked />
          <span className="text-sm">Published (visible to learners)</span>
        </label>
        <button
          type="submit"
          className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-foreground"
        >
          Save series details
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-foreground">Lessons (drag to reorder)</h2>
        <SeriesItemList collectionId={id} items={collection.items} />
        <AddItemPanel collectionId={id} />
      </section>
    </div>
  );
}
