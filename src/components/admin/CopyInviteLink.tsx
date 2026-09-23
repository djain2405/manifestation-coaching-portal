"use client";

import { useState } from "react";
import { inviteNote } from "@/lib/site";
import type { Site } from "@/lib/types";

type Props = {
  token: string;
  site: Pick<Site, "coachName">;
};

export function CopyInviteLink({ token, site }: Props) {
  const [copied, setCopied] = useState<"link" | "note" | null>(null);

  function signupUrl() {
    return `${window.location.origin}/signup?invite=${token}`;
  }

  async function copy(text: string, kind: "link" | "note") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt(kind === "note" ? "Copy this invite note:" : "Copy this invite link:", text);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => copy(signupUrl(), "link")}
        className={
          copied === "link"
            ? "min-h-10 rounded-lg border border-green-600/40 bg-green-50 px-4 text-sm font-medium text-green-700"
            : "min-h-10 rounded-lg border border-accent bg-accent/10 px-4 text-sm font-medium text-accent"
        }
      >
        {copied === "link" ? "Copied!" : "Copy signup link"}
      </button>
      <button
        type="button"
        onClick={() => copy(inviteNote(site, signupUrl()), "note")}
        className={
          copied === "note"
            ? "min-h-10 rounded-lg border border-green-600/40 bg-green-50 px-4 text-sm font-medium text-green-700"
            : "min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-foreground"
        }
      >
        {copied === "note" ? "Copied!" : "Copy invite note"}
      </button>
    </div>
  );
}
