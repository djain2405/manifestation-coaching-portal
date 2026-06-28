"use client";

import { resetPasswordAction } from "@/app/login/actions";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-base font-medium text-accent underline"
      >
        Forgot your password?
      </button>
    );
  }

  return (
    <form action={resetPasswordAction} className="space-y-3 text-left">
      <p className="text-sm text-muted">
        Enter your email and we&apos;ll send a reset link.
      </p>
      <input
        name="email"
        type="email"
        required
        placeholder="your@email.com"
        className="w-full min-h-12 rounded-xl border border-border bg-white px-4 py-3 text-base"
      />
      <button
        type="submit"
        className="w-full min-h-12 rounded-lg border border-accent bg-accent/10 py-3 text-base font-semibold text-accent"
      >
        Send reset link
      </button>
    </form>
  );
}
