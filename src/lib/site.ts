import type { Site } from "./types";

const DEFAULT_WELCOME_MESSAGE =
  "I'm glad you're here. This is a private space I made for the people I work with. Go at your own pace — watch, reflect, and mark each step complete when it feels done.";

export function firstName(fullName: string | null | undefined): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? "";
}

export function getCoachName(site: Pick<Site, "coachName">): string {
  return site.coachName?.trim() || "your coach";
}

export function getCoachPossessive(site: Pick<Site, "coachName">): string {
  const name = site.coachName?.trim();
  if (!name) return "your coach's";
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

export function getHelpLine(site: Site): string {
  return (
    site.contactLine?.trim() ||
    `Message ${getCoachName(site)} if you need help.`
  );
}

export function getWelcomeMessage(site: Site): string {
  return site.welcomeMessage?.trim() || DEFAULT_WELCOME_MESSAGE;
}

export function isSafePhotoUrl(url: string): boolean {
  if (!url) return true;
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function inviteNote(site: Pick<Site, "coachName">, url: string): string {
  return [
    `You're invited into ${getCoachPossessive(site)} private space. This link is only for you:`,
    "",
    url,
    "",
    "Create your account with the email this was sent to — it's locked to you.",
  ].join("\n");
}

export function safeInternalPath(path: string | null | undefined, fallback = "/"): string {
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return fallback;
}
