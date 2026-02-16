import { cookies } from "next/headers";

export type SessionUser = {
  sub: string;
  role: "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN";
  email: string;
  exp: number;
  iat: number;
};

const decodePayload = (token: string): SessionUser | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
};

export const getSessionUser = async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  const payload = decodePayload(token);
  if (!payload) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) return null;

  return payload;
};

export const roleHome = (role: SessionUser["role"]): string => {
  if (role === "ADMIN") return "/admin";
  if (role === "HR") return "/hr";
  if (role === "MANAGER") return "/manager";
  return "/employee";
};
