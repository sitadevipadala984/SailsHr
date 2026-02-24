import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const [departmentsResponse, employeesResponse] = await Promise.all([
    fetch(`${baseUrl}/api/v1/departments`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/employees`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
  ]);

  const departments = await departmentsResponse.json();
  const employees = await employeesResponse.json();

  return (
    <main className="space-y-5">
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today Status</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">Operational</p>
          <p className="text-sm text-slate-600">All core systems healthy</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming Leave</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{employees.length}</p>
          <p className="text-sm text-slate-600">Total employee records</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Actions</p>
          <p className="mt-2 text-sm text-slate-700">Manage organization settings, departments, and employee controls.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Attendance Summary</p><p className="mt-2 text-2xl font-semibold text-slate-900">N/A</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Leave Balance</p><p className="mt-2 text-2xl font-semibold text-slate-900">N/A</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Upcoming Holidays</p><p className="mt-2 text-sm text-slate-700">19 Mar · Ugadi</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Payslip Preview</p><p className="mt-2 text-2xl font-semibold text-slate-900">Jan 2026</p></article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl">Departments</h2>
        <pre className="mt-3">{JSON.stringify(departments, null, 2)}</pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl">Employee Controls</h2>
        <pre className="mt-3">{JSON.stringify(employees, null, 2)}</pre>
      </section>
    </main>
  );
}
