import { getEmbedUrl } from "@/lib/embed";
import type { Embed } from "@/lib/types";

type Props = {
  embed: Embed;
  title: string;
};

export function EmbedPlayer({ embed, title }: Props) {
  const src = getEmbedUrl(embed);
  if (!src) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-1 ring-accent/10">
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
