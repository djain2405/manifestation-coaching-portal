"use client";

import { useState } from "react";
import { revokeInviteAction } from "@/app/admin/actions";

type Props = {
  inviteId: string;
};

export function RevokeInviteButton({ inviteId }: Props) {
  const [pending, setPending] = useState(false);

  async function handleRevoke() {
    if (!confirm("Revoke this invite? The signup link will stop working.")) {
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", inviteId);
      await revokeInviteAction(fd);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRevoke}
      disabled={pending}
      className="min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-muted hover:border-red-300 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? "Revoking…" : "Revoke"}
    </button>
  );
}
