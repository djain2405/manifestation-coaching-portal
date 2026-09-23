"use client";

type Props = {
  show: boolean;
  message?: string;
};

export function CompleteBurst({
  show,
  message = "Marked complete",
}: Props) {
  if (!show) return null;

  return (
    <div
      className="complete-pulse fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full border border-accent/50 bg-surface px-5 py-2.5 text-sm font-semibold text-accent shadow-xl shadow-accent/25 lg:bottom-8"
      role="status"
    >
      {message}
    </div>
  );
}
