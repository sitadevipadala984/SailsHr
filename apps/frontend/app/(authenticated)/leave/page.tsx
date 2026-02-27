import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";
import { applyLeaveAction } from "./actions";
import { LeaveApplyForm } from "./leave-apply-form";

export default async function LeavePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const balanceRes = await fetch(`${baseUrl}/api/v1/leave-balances`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });

  if (!balanceRes.ok) redirect("/login");
  const balances = (await balanceRes.json()) as Array<{
    employeeId: string;
    balance: number;
    used: number;
    total: number;
  }>;

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-semibold text-text-primary">Leave</h1>
      <LeaveApplyForm action={applyLeaveAction} balances={balances} />
    </main>
  );
}
