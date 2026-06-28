import Link from "next/link";
import type { Collection } from "@/lib/types";
import type { Site } from "@/lib/types";
import type { SiteLabels } from "@/lib/types";
import { getCollectionStyle } from "@/lib/collection-style";
import { PathNav } from "./PathNav";
import { MobilePathDrawer } from "./MobilePathDrawer";
import { SignOutButton } from "./SignOutButton";

type Props = {
  site: Site;
  collection: Collection;
  labels: SiteLabels;
  activeItemSlug?: string;
  showAdminLink?: boolean;
  children: React.ReactNode;
};

export function PortalShell({
  site,
  collection,
  labels,
  activeItemSlug,
  showAdminLink,
  children,
}: Props) {
  const style = getCollectionStyle(collection);

  return (
    <div style={style} className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-white">
        <div className="border-b border-border/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <Link
              href="/"
              prefetch={false}
              className="font-display text-xl text-foreground"
            >
              {site.title}
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              {showAdminLink ? (
                <Link
                  href="/admin"
                  prefetch={false}
                  className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent"
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href={`/course/${collection.slug}`}
                prefetch={false}
                className="rounded-full border border-border/80 bg-surface/80 px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {collection.title}
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:gap-12">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-8">
            <PathNav
              collection={collection}
              labels={labels}
              activeItemSlug={activeItemSlug}
            />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <MobilePathDrawer
        collection={collection}
        labels={labels}
        activeItemSlug={activeItemSlug}
      />
    </div>
  );
}
