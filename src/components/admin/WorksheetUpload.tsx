"use client";

import { uploadWorksheetAction } from "@/app/admin/actions";

type Props = {
  itemId: string;
  collectionId: string;
  currentPath?: string;
};

export function WorksheetUpload({ itemId, collectionId, currentPath }: Props) {
  return (
    <form
      action={uploadWorksheetAction.bind(null, itemId, collectionId)}
      className="mt-2 flex flex-wrap items-center gap-2"
    >
      <input
        type="file"
        name="file"
        accept="application/pdf"
        className="text-sm"
        required={!currentPath}
      />
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 text-sm"
      >
        Upload PDF
      </button>
      {currentPath ? (
        <a
          href={currentPath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent underline"
        >
          Current PDF
        </a>
      ) : null}
    </form>
  );
}
