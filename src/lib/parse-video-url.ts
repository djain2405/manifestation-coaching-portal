import type { Embed, EmbedProvider } from "./types";

export function parseVideoUrl(
  url: string,
): { provider: EmbedProvider; id: string } | null {
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch) return { provider: "loom", id: loomMatch[1] };

  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) return { provider: "youtube", id: ytMatch[1] };

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { provider: "vimeo", id: vimeoMatch[1] };

  return null;
}

export function embedToPasteUrl(embed: Embed): string {
  switch (embed.provider) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${embed.id}`;
    case "loom":
      return `https://www.loom.com/share/${embed.id}`;
    case "vimeo":
      return `https://vimeo.com/${embed.id}`;
    default:
      return "";
  }
}
