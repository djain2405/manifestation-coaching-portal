"use client";

import { useState } from "react";
import type { Collection } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { PathNav } from "./PathNav";

type Props = {
  collection: Collection;
  labels: SiteLabels;
  activeItemSlug?: string;
};

export function MobilePathDrawer({
  collection,
  labels,
  activeItemSlug,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 min-h-12 rounded-full bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-lg"
      >
        {labels.path}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close path"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(100%,20rem)] overflow-y-auto border-r border-border bg-surface p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg">{collection.title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-muted hover:text-foreground"
              >
                Close
              </button>
            </div>
            <PathNav
              collection={collection}
              labels={labels}
              activeItemSlug={activeItemSlug}
            />
          </aside>
        </>
      ) : null}
    </div>
  );
}
