import type { Embed } from "./types";

export function getEmbedUrl(embed: Embed): string {
  switch (embed.provider) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${embed.id}?rel=0`;
    case "vimeo":
      return `https://player.vimeo.com/video/${embed.id}`;
    case "loom":
      return `https://www.loom.com/embed/${embed.id}`;
    default:
      return "";
  }
}
