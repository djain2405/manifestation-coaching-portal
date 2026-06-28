"use client";

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
import type { Item } from "@/lib/types";
import { reorderItemsAction, deleteItemAction } from "@/app/admin/actions";
import { WorksheetUpload } from "./WorksheetUpload";
import { isActivityItem } from "@/lib/items";

type Props = {
  collectionId: string;
  items: Item[];
};

function SortableRow({
  item,
  collectionId,
}: {
  item: Item;
  collectionId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-border bg-white p-4"
    >
      <button
        type="button"
        className="cursor-grab px-2 text-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>
      <span className="text-xl" aria-hidden>
        {item.emoji ?? (item.type === "activity" ? "📝" : "▶")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{item.title}</p>
        <p className="text-sm text-muted">
          {item.type} · {item.slug}
        </p>
        {isActivityItem(item) && item.id ? (
          <WorksheetUpload
            itemId={item.id}
            collectionId={collectionId}
            currentPath={item.activity?.pdf}
          />
        ) : null}
      </div>
      <form action={deleteItemAction.bind(null, item.id!, collectionId)}>
        <button
          type="submit"
          className="rounded-lg border border-border px-3 py-2 text-sm text-red-600"
        >
          Delete
        </button>
      </form>
    </li>
  );
}

export function SeriesItemList({ collectionId, items }: Props) {
  const router = useRouter();
  const ids = items.map((i) => i.id!).filter(Boolean);
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
    await reorderItemsAction(collectionId, next);
    router.refresh();
  }

  if (ids.length === 0) {
    return <p className="text-muted">No lessons yet. Add one below.</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item) =>
            item.id ? (
              <SortableRow
                key={item.id}
                item={item}
                collectionId={collectionId}
              />
            ) : null,
          )}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
