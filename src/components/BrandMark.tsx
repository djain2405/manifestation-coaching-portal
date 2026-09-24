type GlyphProps = {
  className?: string;
};

export function BrandGlyph({ className = "h-10 w-10" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      aria-hidden
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <path
        d="M10 22q14 7 28 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="16" r="1.7" fill="currentColor" />
      <circle cx="30" cy="16" r="1.7" fill="currentColor" />
    </svg>
  );
}

type MarkProps = {
  title: string;
  className?: string;
  glyphClassName?: string;
  titleClassName?: string;
};

export function BrandMark({
  title,
  className = "inline-flex items-center gap-3 text-accent",
  glyphClassName,
  titleClassName = "font-display text-xl text-foreground",
}: MarkProps) {
  return (
    <span className={className}>
      <BrandGlyph className={glyphClassName ?? "h-9 w-9"} />
      <span className={titleClassName}>{title}</span>
    </span>
  );
}
