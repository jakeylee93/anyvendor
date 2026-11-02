// AES-256-GCM encryption for provider tokens at rest, and HMAC-signed OAuth state.
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function key(secret: string) {
  const k = Buffer.from(secret, "base64");
  if (k.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  return k;
}

export function encryptToken(plain: string, secret: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(secret), iv);
  const body = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), body.toString("base64url")].join(":");
}

export function decryptToken(sealed: string, secret: string): string {
  const [v, iv, tag, body] = sealed.split(":");
  if (v !== "v1" || !iv || !tag || !body) throw new Error("Unrecognised token format");
  const d = createDecipheriv("aes-256-gcm", key(secret), Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(body, "base64url")), d.final()]).toString("utf8");
}

export interface OAuthState {
  businessId: string;
  userId: string;
  provider: string;
  verifier?: string;
  exp: number;
}

export function signState(state: OAuthState, secret: string): string {
  const body = Buffer.from(JSON.stringify(state)).toString("base64url");
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyState(token: string, secret: string, now = Date.now()): OAuthState | null {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expect = createHmac("sha256", secret).update(body).digest();
  const got = Buffer.from(mac, "base64url");
  if (got.length !== expect.length || !timingSafeEqual(got, expect)) return null;
  const state = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OAuthState;
  return state.exp > now ? state : null;
}
