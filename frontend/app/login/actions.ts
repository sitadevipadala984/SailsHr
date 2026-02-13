"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { roleHome } from "../../lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  if (!response.ok) {
    redirect("/login?error=Invalid%20credentials");
  }

  const body = (await response.json()) as {
    accessToken: string;
    expiresIn: number;
    user: { role: "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN" };
  };

  const cookieStore = await cookies();
  cookieStore.set("access_token", body.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: body.expiresIn
  });

  redirect(roleHome(body.user.role));
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect("/login");
}
