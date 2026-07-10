"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { revokeInviteAction } from "@/app/admin/actions";

type Props = {
  inviteId: string;
};

export function RevokeInviteButton({ inviteId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke() {
    if (!confirm("Revoke this invite? The signup link will stop working.")) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("id", inviteId);
      await revokeInviteAction(fd);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke invite.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleRevoke}
        disabled={pending}
        className="min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-muted hover:border-red-300 hover:text-red-600 disabled:opacity-50"
      >
        {pending ? "Revoking…" : "Revoke"}
      </button>
      {error ? (
        <p className="max-w-xs text-right text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
