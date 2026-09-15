// src/lib/auth.ts
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "konsel-ai-smk-sangkuriang-1-cimahi-secret-2026";
export const AUTH_COOKIE_NAME = "konsel_admin_token";

export interface SessionData {
  username: string;
  name: string;
  role: string;
  exp: number;
}

export function createAdminToken(username: string, name: string = "Administrator"): string {
  const payload: SessionData = {
    username,
    name,
    role: "admin",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadStr)
    .digest("base64url");

  return `${payloadStr}.${signature}`;
}

export function verifyAdminToken(token: string): SessionData | null {
  if (!token || !token.includes(".")) return null;

  const [payloadStr, signature] = token.split(".");
  if (!payloadStr || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadStr)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload: SessionData = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.exp) {
      return null;
    }

    // Pastikan hanya username admin
    if (payload.username.toLowerCase() !== "admin") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
