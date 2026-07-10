"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInviteAction } from "@/app/admin/actions";
import { CopyInviteLink } from "./CopyInviteLink";

export function CreateInviteForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);
    const fd = new FormData(form);
    try {
      const t = await createInviteAction(fd);
      setToken(t);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invite.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-2xl border border-border bg-white p-6"
      >
        <div className="flex flex-wrap gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Client email"
            className="min-h-12 flex-1 rounded-xl border border-border px-4"
          />
          <input
            name="days"
            type="number"
            defaultValue={7}
            min={1}
            max={90}
            aria-label="Days until invite expires"
            className="min-h-12 w-24 rounded-xl border border-border px-4"
          />
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-foreground disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create invite"}
          </button>
        </div>
        <p className="text-sm text-muted">
          Only this email can use the invite link. Days = how long the link stays
          open (1–90).
        </p>
        {error ? (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}
      </form>
      {token ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="mb-2 text-sm text-muted">
            New invite created — copy and send only to that client:
          </p>
          <CopyInviteLink token={token} />
        </div>
      ) : null}
    </div>
  );
}
