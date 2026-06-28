"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadWorksheetAction } from "@/app/admin/actions";

type Props = {
  itemId: string;
  collectionId: string;
  currentPath?: string;
};

export function WorksheetUpload({ itemId, collectionId, currentPath }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(currentPath);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile) {
      fileInputRef.current?.click();
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.set("file", selectedFile);
      const url = await uploadWorksheetAction(itemId, collectionId, formData);
      setPdfUrl(url);
      setSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setSuccess(false);
    setError(null);
  }

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-dashed border-border bg-surface/50 p-4">
      <p className="text-sm font-medium text-foreground">Worksheet PDF</p>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          disabled={pending}
          onChange={handleFileChange}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
            className="min-h-10 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground hover:border-accent/40 disabled:opacity-50"
          >
            Choose PDF
          </button>
          <button
            type="submit"
            disabled={pending || !selectedFile}
            className="min-h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Uploading…" : "Upload PDF"}
          </button>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-10 inline-flex items-center rounded-lg border border-accent/40 bg-accent/10 px-4 text-sm font-medium text-accent"
            >
              View current PDF
            </a>
          ) : null}
        </div>
        <p className="text-sm text-muted">
          {selectedFile
            ? `Selected: ${selectedFile.name}`
            : pdfUrl
              ? "Pick a new file to replace the current PDF."
              : "No PDF yet — choose a file, then upload."}
        </p>
        {success ? (
          <p className="text-sm text-green-700">PDF uploaded successfully.</p>
        ) : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </form>
    </div>
  );
}
