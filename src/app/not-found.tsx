import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-5xl text-foreground">
        Lost signal
      </h1>
      <p className="text-muted">That page isn&apos;t in the portal.</p>
      <Link
        href="/login"
        prefetch={false}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        Go to login
      </Link>
    </div>
  );
}
