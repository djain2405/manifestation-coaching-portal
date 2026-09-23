import { BrandGlyph } from "./BrandMark";
import { isSafePhotoUrl } from "@/lib/site";

type Props = {
  name: string;
  photoUrl?: string;
  size?: "sm" | "md";
  onDark?: boolean;
};

export function CoachPresence({ name, photoUrl, size = "md", onDark }: Props) {
  const dimension = size === "sm" ? "h-10 w-10" : "h-14 w-14";
  const safePhoto = photoUrl && isSafePhotoUrl(photoUrl) ? photoUrl : "";
  const nameClass = onDark ? "text-white" : "text-foreground";
  const labelClass = onDark ? "text-white/70" : "text-muted";

  return (
    <div className="flex items-center justify-center gap-3 sm:justify-start">
      {safePhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safePhoto}
          alt=""
          className={`${dimension} rounded-full object-cover ring-1 ring-border`}
        />
      ) : (
        <span
          className={`flex ${dimension} items-center justify-center rounded-full border border-current/20 text-accent ${
            onDark ? "border-white/30 text-white" : ""
          }`}
        >
          <BrandGlyph className={size === "sm" ? "h-6 w-6" : "h-8 w-8"} />
        </span>
      )}
      <div className="text-left">
        <p className={`text-sm ${labelClass}`}>A private space from</p>
        <p className={`font-display text-lg ${nameClass}`}>{name}</p>
      </div>
    </div>
  );
}
