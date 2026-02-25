import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";

export default async function HrPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "HR" && user.role !== "ADMIN") redirect("/");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const [dashboardResponse, employeesResponse] = await Promise.all([
    fetch(`${baseUrl}/api/v1/dashboard/hr`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/employees`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
  ]);
  const dashboard = await dashboardResponse.json();
  const employees = await employeesResponse.json();

  return (
    <main className="space-y-6">
      <section className="grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-sm lg:grid-cols-3">
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Today Status</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary">{dashboard.presentToday ?? 0}</p>
          <p className="mt-2 text-sm text-text-secondary">Employees present</p>
        </div>
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Upcoming Leave</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary">{dashboard.pendingLeaveRequests ?? 0}</p>
          <p className="mt-2 text-sm text-text-secondary">Pending leave requests</p>
        </div>
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Quick Actions</p>
          <p className="mt-2 text-sm text-text-secondary">Review HR insights and employee directory for workforce planning.</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm text-text-secondary">Attendance Summary</p><p className="mt-2 text-3xl font-semibold text-text-primary">{dashboard.attendancePercent ?? "--"}%</p></article>
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm text-text-secondary">Leave Balance</p><p className="mt-2 text-3xl font-semibold text-text-primary">{dashboard.pendingLeaveRequests ?? 0}</p><p className="mt-2 text-sm text-text-secondary">Open leave tickets</p></article>
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm text-text-secondary">Upcoming Holidays</p><p className="mt-2 text-sm text-text-secondary">19 Mar · Ugadi</p><p className="mt-1 text-sm text-text-secondary">29 Mar · Holi</p></article>
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm text-text-secondary">Payslip Preview</p><p className="mt-2 text-2xl font-semibold text-text-primary">Jan 2026</p></article>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-text-primary">Org Snapshot</h2>
        <pre className="mt-4">{JSON.stringify(dashboard, null, 2)}</pre>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-text-primary">Employee Directory</h2>
        <pre className="mt-4">{JSON.stringify(employees, null, 2)}</pre>
      </section>
    </main>
  );
}
