"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const callAttendance = async (path: string): Promise<{ ok: boolean; message?: string }> => {
  const token = (await cookies()).get("access_token")?.value;

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ message: "Attendance operation failed" }))) as {
      message?: string;
    };
    return { ok: false, message: body.message ?? "Attendance operation failed" };
  }

  return { ok: true };
};

export async function punchInAction(): Promise<void> {
  const result = await callAttendance("/api/v1/attendance/punch-in");
  if (!result.ok) {
    redirect(`/employee?error=${encodeURIComponent(result.message ?? "Punch-in failed")}`);
  }

  redirect(`/employee?updated=${Date.now()}`);
}

export async function punchOutAction(): Promise<void> {
  const result = await callAttendance("/api/v1/attendance/punch-out");
  if (!result.ok) {
    redirect(`/employee?error=${encodeURIComponent(result.message ?? "Punch-out failed")}`);
  }

  redirect(`/employee?updated=${Date.now()}`);
}
