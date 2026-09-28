import { ADMIN_COOKIE_NAME, isSessionValueValid } from "./adminSession";

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((part) => {
    const [name, ...valueParts] = part.trim().split("=");
    if (name) {
      cookies[name.trim()] = decodeURIComponent(valueParts.join("=").trim());
    }
  });
  return cookies;
}

export async function validateAdminSession(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);
  const sessionValue = cookies[ADMIN_COOKIE_NAME];
  return isSessionValueValid(sessionValue);
}
