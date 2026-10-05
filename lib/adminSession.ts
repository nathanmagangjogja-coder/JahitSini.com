import { getSessionSecret } from "./adminConfig";

const COOKIE_NAME = "jahitsini_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60; // 1 jam

function getSecret(): string {
  return getSessionSecret();
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const len = Math.floor(hex.length / 2);
  const buffer = new ArrayBuffer(len);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionCookieValue(): Promise<string> {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS);
  const key = await getHmacKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expires));
  return `${expires}.${toHex(sigBuf)}`;
}

export async function isSessionValueValid(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const [expires, signatureHex] = value.split(".");
  if (!expires || !signatureHex || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;

  const key = await getHmacKey();
  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      fromHex(signatureHex) as BufferSource,
      new TextEncoder().encode(expires)
    );
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_DURATION_SECONDS;