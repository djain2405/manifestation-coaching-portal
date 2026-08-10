"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Collection } from "@/lib/types";
import { reorderCollectionsAction } from "@/app/admin/actions";
import { DeleteSeriesButton } from "./DeleteSeriesButton";

type Props = {
  collections: Collection[];
};

function SortableSeriesRow({ collection }: { collection: Collection }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: collection.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5"
    >
      <button
        type="button"
        className="cursor-grab shrink-0 px-2 text-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${collection.title}`}
      >
        ⋮⋮
      </button>
      <Link
        href={`/admin/series/${collection.id}`}
        className="min-w-0 flex-1 hover:opacity-90"
      >
        <h2 className="font-display text-xl text-foreground">
          {collection.title}
        </h2>
        <p className="text-sm text-muted">
          {collection.items.length} lessons · /course/{collection.slug}
          {" · "}
          <span
            className={
              collection.published
                ? "text-green-700"
                : "font-medium text-amber-700"
            }
          >
            {collection.published
              ? "Published"
              : "Draft — not visible to learners"}
          </span>
        </p>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/admin/series/${collection.id}`}
          className="rounded-lg border border-border px-3 py-2 text-sm text-accent"
        >
          Edit
        </Link>
        {collection.id ? (
          <DeleteSeriesButton
            collectionId={collection.id}
            title={collection.title}
            lessonCount={collection.items.length}
          />
        ) : null}
      </div>
    </li>
  );
}

export function SeriesList({ collections }: Props) {
  const router = useRouter();
  const ids = collections.map((c) => c.id!).filter(Boolean);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const next = [...ids];
    const [removed] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, removed);
    await reorderCollectionsAction(next);
    router.refresh();
  }

  if (ids.length === 0) {
    return <p className="text-muted">No series yet. Add one above.</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3">
          {collections.map((collection) =>
            collection.id ? (
              <SortableSeriesRow key={collection.id} collection={collection} />
            ) : null,
          )}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
