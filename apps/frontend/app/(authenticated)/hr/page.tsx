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
    <main className="space-y-5">
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today Status</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{dashboard.presentToday ?? 0}</p>
          <p className="text-sm text-slate-600">Employees present</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming Leave</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{dashboard.pendingLeaveRequests ?? 0}</p>
          <p className="text-sm text-slate-600">Pending leave requests</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Actions</p>
          <p className="mt-2 text-sm text-slate-700">Review HR insights and employee directory for workforce planning.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Attendance Summary</p><p className="mt-2 text-3xl font-semibold text-slate-900">{dashboard.attendancePercent ?? "--"}%</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Leave Balance</p><p className="mt-2 text-3xl font-semibold text-slate-900">{dashboard.pendingLeaveRequests ?? 0}</p><p className="text-sm text-slate-600">Open leave tickets</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Upcoming Holidays</p><p className="mt-2 text-sm text-slate-700">19 Mar · Ugadi</p><p className="text-sm text-slate-700">29 Mar · Holi</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Payslip Preview</p><p className="mt-2 text-2xl font-semibold text-slate-900">Jan 2026</p></article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl">Org Snapshot</h2>
        <pre className="mt-3">{JSON.stringify(dashboard, null, 2)}</pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl">Employee Directory</h2>
        <pre className="mt-3">{JSON.stringify(employees, null, 2)}</pre>
      </section>
    </main>
  );
}
