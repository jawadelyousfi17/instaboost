/**
 * Canonical base URL for the deployed app.
 * Defaults to localhost in dev — set NEXT_PUBLIC_APP_URL in production
 * (e.g. https://instaboost.app) so OAuth redirects, payment callbacks,
 * and outbound links resolve to the real host.
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  return url || "http://localhost:3000";
}
