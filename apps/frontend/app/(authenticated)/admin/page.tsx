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
    <main className="space-y-6">
      <section className="grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-sm lg:grid-cols-3">
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Today Status</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary">Operational</p>
          <p className="mt-2 text-sm text-text-secondary">All core systems healthy</p>
        </div>
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Upcoming Leave</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary">{employees.length}</p>
          <p className="mt-2 text-sm text-text-secondary">Total employee records</p>
        </div>
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Quick Actions</p>
          <p className="mt-2 text-sm text-text-secondary">Manage organization settings, departments, and employee controls.</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm text-text-secondary">Attendance Summary</p><p className="mt-2 text-2xl font-semibold text-text-primary">N/A</p></article>
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm text-text-secondary">Leave Balance</p><p className="mt-2 text-2xl font-semibold text-text-primary">N/A</p></article>
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm text-text-secondary">Upcoming Holidays</p><p className="mt-2 text-sm text-text-secondary">19 Mar · Ugadi</p></article>
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm text-text-secondary">Payslip Preview</p><p className="mt-2 text-2xl font-semibold text-text-primary">Jan 2026</p></article>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-text-primary">Departments</h2>
        <pre className="mt-4">{JSON.stringify(departments, null, 2)}</pre>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-text-primary">Employee Controls</h2>
        <pre className="mt-4">{JSON.stringify(employees, null, 2)}</pre>
      </section>
    </main>
  );
}
