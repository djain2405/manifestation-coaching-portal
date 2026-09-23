import type { ReactNode } from "react";
import type { Site } from "@/lib/types";
import { BrandGlyph } from "./BrandMark";
import { AuthOrnament } from "./Ornaments";

type Props = {
  site: Site;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  presence?: ReactNode;
  showPrivacyNote?: boolean;
};

export function AuthShell({
  site,
  eyebrow,
  title,
  description,
  children,
  footer,
  presence,
  showPrivacyNote = true,
}: Props) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      <AuthOrnament />
      <div className="relative z-10 w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center text-accent">
            <BrandGlyph className="h-12 w-12" />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-accent">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <div className="text-lg text-muted">{description}</div>
          {presence}
        </div>
        {children}
        {footer}
        {showPrivacyNote ? (
          <p className="text-sm text-muted">{site.title} is invite-only.</p>
        ) : null}
      </div>
    </div>
  );
}
