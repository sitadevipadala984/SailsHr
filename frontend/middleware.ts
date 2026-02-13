import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/employee", "/manager", "/hr", "/admin", "/employees"];

const roleRoutes: Record<string, string[]> = {
  EMPLOYEE: ["/employee"],
  MANAGER: ["/manager", "/employees"],
  HR: ["/manager", "/hr", "/employees"],
  ADMIN: ["/manager", "/hr", "/admin", "/employees"]
};

const parseRole = (token: string): string | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: string; exp?: number };
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.exp || parsed.exp <= now) return null;
    return parsed.role ?? null;
  } catch {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((item) => path.startsWith(item));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = parseRole(token);
  if (!role) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    return response;
  }

  const allowed = roleRoutes[role]?.some((item) => path.startsWith(item));
  if (!allowed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/employee/:path*", "/manager/:path*", "/hr/:path*", "/admin/:path*", "/employees/:path*"]
};
