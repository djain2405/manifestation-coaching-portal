import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { logoutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-full bg-surface">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-display text-xl text-foreground">
            Manifest Portal Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-accent underline">
              Learner site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
