"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const getToken = async (): Promise<string | undefined> => (await cookies()).get("access_token")?.value;

export async function applyLeaveAction(formData: FormData): Promise<void> {
  const token = await getToken();
  const type = String(formData.get("type") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const reason = String(formData.get("reason") ?? "");

  if (!type || !startDate || !endDate) {
    redirect("/employee?leaveError=Type,%20start%20date%20and%20end%20date%20are%20required");
  }

  const response = await fetch(`${baseUrl}/api/v1/leaves/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ type, startDate, endDate, reason }),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ message: "Leave apply failed" }))) as { message?: string };
    redirect(`/employee?leaveError=${encodeURIComponent(body.message ?? "Leave apply failed")}`);
  }

  redirect(`/employee?leaveUpdated=${Date.now()}`);
}

export async function decideLeaveAction(leaveId: string, action: "APPROVE" | "REJECT"): Promise<void> {
  const token = await getToken();

  const response = await fetch(`${baseUrl}/api/v1/leaves/${leaveId}/decision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ action }),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ message: "Leave decision failed" }))) as { message?: string };
    redirect(`/manager?leaveError=${encodeURIComponent(body.message ?? "Leave decision failed")}`);
  }

  redirect(`/manager?leaveUpdated=${Date.now()}`);
}
