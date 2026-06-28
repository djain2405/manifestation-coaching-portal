export const PORTAL_COOKIE = "portal_session";
export const PORTAL_COOKIE_VALUE = "authenticated";

export function isAuthenticated(cookieValue: string | undefined): boolean {
  return cookieValue === PORTAL_COOKIE_VALUE;
}

export function getPortalPassword(): string {
  return process.env.PORTAL_PASSWORD ?? "night-school";
}
