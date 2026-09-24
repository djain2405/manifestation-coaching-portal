export type PasswordChangeErrorKind =
  | "invalid"
  | "same"
  | "weak"
  | "session"
  | "retry"
  | "update";

export function classifyPasswordChangeError(
  message: string,
  code?: string,
): PasswordChangeErrorKind {
  const text = `${code ?? ""} ${message}`.toLowerCase();
  if (text.includes("same_password") || text.includes("different from the old")) {
    return "same";
  }
  if (
    text.includes("weak") ||
    text.includes("pwned") ||
    text.includes("leaked") ||
    text.includes("easy to guess") ||
    text.includes("too common")
  ) {
    return "weak";
  }
  if (text.includes("rate") || text.includes("too many")) {
    return "retry";
  }
  if (
    text.includes("session") ||
    text.includes("jwt") ||
    text.includes("not authenticated") ||
    text.includes("unauthorized")
  ) {
    return "session";
  }
  return "update";
}

export function passwordChangeErrorCopy(kind: string): string {
  switch (kind) {
    case "invalid":
      return "Passwords must match and be at least 8 characters.";
    case "same":
      return "Choose a password you are not already using.";
    case "weak":
      return "That password is too common. Please pick a different one.";
    case "session":
      return "Please sign out, sign in, and try again.";
    case "retry":
      return "Too many attempts. Wait a minute, then try again.";
    default:
      return "We couldn’t update your password. Please try again.";
  }
}

export function isSessionAuthError(
  message: string,
  code?: string,
  status?: number,
): boolean {
  if (status === 401) return true;
  return classifyPasswordChangeError(message, code) === "session";
}

export function decodePasswordChangeReason(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const text = decodeURIComponent(raw).replace(/\s+/g, " ").trim();
    if (!text || text.length > 200) return null;
    return text;
  } catch {
    return null;
  }
}
