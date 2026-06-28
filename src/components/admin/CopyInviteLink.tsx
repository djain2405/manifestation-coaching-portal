"use client";

type Props = {
  token: string;
};

export function CopyInviteLink({ token }: Props) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "";
  const url = `${origin}/signup?invite=${token}`;

  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(url)}
      className="min-h-10 rounded-lg border border-accent bg-accent/10 px-4 text-sm font-medium text-accent"
    >
      Copy signup link
    </button>
  );
}
