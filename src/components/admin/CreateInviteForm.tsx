"use client";

import { useState } from "react";
import { createInviteAction } from "@/app/admin/actions";
import { CopyInviteLink } from "./CopyInviteLink";

export function CreateInviteForm() {
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const t = await createInviteAction(fd);
      setToken(t);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 rounded-2xl border border-border bg-white p-6"
      >
        <input
          name="email"
          type="email"
          placeholder="Lock to email (optional)"
          className="min-h-12 flex-1 rounded-xl border border-border px-4"
        />
        <input
          name="days"
          type="number"
          defaultValue={7}
          min={1}
          max={90}
          className="min-h-12 w-24 rounded-xl border border-border px-4"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-foreground disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create invite"}
        </button>
      </form>
      {token ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="mb-2 text-sm text-muted">New invite created — copy and send:</p>
          <CopyInviteLink token={token} />
        </div>
      ) : null}
    </div>
  );
}
