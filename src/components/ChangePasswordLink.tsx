import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Props = {
  className?: string;
};

export function ChangePasswordLink({ className }: Props) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return (
    <Link
      href="/account"
      prefetch={false}
      className={
        className ??
        "whitespace-nowrap rounded-full border border-border/80 bg-surface/80 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground sm:px-4"
      }
    >
      <span className="sm:hidden">Password</span>
      <span className="hidden sm:inline">Change password</span>
    </Link>
  );
}
