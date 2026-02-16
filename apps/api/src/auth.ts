import { createHmac, timingSafeEqual } from "node:crypto";

export type UserRole = "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  employeeId: string;
};

export type JwtPayload = {
  sub: string;
  role: UserRole;
  email: string;
  exp: number;
  iat: number;
};

const secret = process.env.JWT_SECRET ?? "sailshr-dev-secret";
const ttlSeconds = Number(process.env.JWT_TTL_SECONDS ?? 60 * 60);

const toBase64Url = (input: string): string =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const signData = (data: string): string =>
  createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

export const issueToken = (user: AuthUser): string => {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    iat: now,
    exp: now + ttlSeconds
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const body = `${header}.${encodedPayload}`;
  const signature = signData(body);
  return `${body}.${signature}`;
};

export const verifyToken = (token: string): JwtPayload | null => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [header, payload, signature] = parts;
  const expected = signData(`${header}.${payload}`);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    if (parsed.exp <= now) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const getTtlSeconds = (): number => ttlSeconds;
