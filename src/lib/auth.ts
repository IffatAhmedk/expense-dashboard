/**
 * One-person sign-in: a single password (DASHBOARD_PASSWORD) and a signed cookie.
 * The cookie holds an expiry time plus an HMAC of it, so it can't be forged without AUTH_SECRET.
 */
export const SESSION_COOKIE = "hisaab_session";
export const SESSION_DAYS = 30;

const encoder = new TextEncoder();

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return value;
}

async function key() {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const pairs = hex.match(/.{2}/g) ?? [];
  return new Uint8Array(pairs.map((p) => parseInt(p, 16)));
}

export async function createSessionToken() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const signature = await crypto.subtle.sign("HMAC", await key(), encoder.encode(String(expires)));
  return `${expires}.${toHex(signature)}`;
}

export async function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^[0-9a-f]+$/.test(signature)) return false;
  if (Number(expires) < Date.now()) return false;
  return crypto.subtle.verify("HMAC", await key(), fromHex(signature), encoder.encode(expires));
}

/** Compares two strings without leaking how many leading characters matched. */
export async function passwordMatches(attempt: string) {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  const k = await key();
  const [a, b] = await Promise.all([
    crypto.subtle.sign("HMAC", k, encoder.encode(attempt)),
    crypto.subtle.sign("HMAC", k, encoder.encode(expected)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
