"use client";

import { useState } from "react";

type Props = {
  token: string;
};

export function CopyInviteLink({ token }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const origin = window.location.origin;
    const url = `${origin}/signup?invite=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / denied clipboard
      window.prompt("Copy this invite link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        copied
          ? "min-h-10 rounded-lg border border-green-600/40 bg-green-50 px-4 text-sm font-medium text-green-700"
          : "min-h-10 rounded-lg border border-accent bg-accent/10 px-4 text-sm font-medium text-accent"
      }
    >
      {copied ? "Copied!" : "Copy signup link"}
    </button>
  );
}
