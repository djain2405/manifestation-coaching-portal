export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "";
  const isLocal =
    fromEnv.includes("localhost") || fromEnv.includes("127.0.0.1");

  if (process.env.VERCEL_ENV === "production") {
    if (fromEnv && !isLocal) return fromEnv;
    if (vercelProd) return vercelProd;
  }

  if (fromEnv) return fromEnv;
  if (vercelProd) return vercelProd;
  return "http://127.0.0.1:3000";
}
