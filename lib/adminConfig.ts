export const ADMIN_USERNAME = "admin";
export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET wajib diisi di production.");
  }
  return "dev-only-secret-jangan-dipakai-di-production";
}