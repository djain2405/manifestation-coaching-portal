import Link from "next/link";
import { BrandGlyph } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-accent">
        <BrandGlyph className="h-12 w-12" />
      </span>
      <h1 className="font-display text-5xl text-foreground">
        This page isn&apos;t in your path
      </h1>
      <p className="text-muted">Let&apos;s get you back to where you belong.</p>
      <Link
        href="/"
        prefetch={false}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        Back to your path
      </Link>
    </div>
  );
}
