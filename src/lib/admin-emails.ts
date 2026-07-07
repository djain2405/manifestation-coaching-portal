/** Comma-separated list in ADMIN_EMAIL (e.g. "you@x.com,veer@y.com"). */
export function getConfiguredAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL?.trim();
  if (!raw) return [];

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isConfiguredAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getConfiguredAdminEmails().includes(normalized);
}
