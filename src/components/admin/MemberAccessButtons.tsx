"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  restoreMemberAction,
  suspendMemberAction,
} from "@/app/admin/actions";

type Props = {
  memberId: string;
  memberName: string;
  status: "active" | "suspended";
  canManage: boolean;
};

export function MemberAccessButtons({
  memberId,
  memberName,
  status,
  canManage,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canManage) return null;

  async function run(
    action: (fd: FormData) => Promise<void>,
    confirmMessage: string,
  ) {
    if (!confirm(confirmMessage)) return;
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("id", memberId);
      await action(fd);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update access.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {status === "active" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              suspendMemberAction,
              `Suspend ${memberName}? They will not be able to sign in until restored.`,
            )
          }
          className="min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-muted hover:border-red-300 hover:text-red-600 disabled:opacity-50"
        >
          {pending ? "Working…" : "Suspend"}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              restoreMemberAction,
              `Restore access for ${memberName}?`,
            )
          }
          className="min-h-10 rounded-lg border border-accent bg-accent/10 px-4 text-sm font-medium text-accent disabled:opacity-50"
        >
          {pending ? "Working…" : "Restore"}
        </button>
      )}
      {error ? (
        <p className="max-w-xs text-right text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
