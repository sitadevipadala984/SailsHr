import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";
import { decideLeaveAction } from "../leave/actions";

type Attendance = { employeeId: string; date: string; punchIn?: string; punchOut?: string; workHours: number; status: string };
type LeaveRequest = { id: string; employeeId: string; type: "CL" | "SL" | "PL"; startDate: string; endDate: string; totalDays: number; status: string };

export default async function ManagerPage({ searchParams }: { searchParams: Promise<{ leaveError?: string; leaveUpdated?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "MANAGER" && user.role !== "HR" && user.role !== "ADMIN") redirect("/");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const [attendanceResponse, pendingLeavesResponse] = await Promise.all([
    fetch(`${baseUrl}/api/v1/attendance/team`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/leaves/pending-approvals`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
  ]);

  const rows = (await attendanceResponse.json()) as Attendance[];
  const pendingLeaves = (await pendingLeavesResponse.json()) as LeaveRequest[];
  const today = new Date().toISOString().slice(0, 10);
  const todayRows = rows.filter((item) => item.date === today);
  const params = await searchParams;

  return (
    <main className="space-y-5">
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today Team Presence</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{todayRows.length}</p>
          <p className="text-sm text-slate-600">Employees with records today</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Leave</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{pendingLeaves.length}</p>
          <p className="text-sm text-slate-600">Requests awaiting action</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Actions</p>
          <p className="mt-2 text-sm text-slate-700">Review and approve leave requests to keep schedules healthy.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Attendance Summary</p><p className="mt-2 text-2xl font-semibold text-slate-900">{todayRows.filter((r) => r.status === "PRESENT").length} Present</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Half Day</p><p className="mt-2 text-2xl font-semibold text-slate-900">{todayRows.filter((r) => r.status === "HALF_DAY").length}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Approved Leaves</p><p className="mt-2 text-2xl font-semibold text-slate-900">{pendingLeaves.filter((l) => l.status === "APPROVED").length}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Upcoming Holidays</p><p className="mt-2 text-sm text-slate-700">19 Mar · Ugadi</p><p className="text-sm text-slate-700">29 Mar · Holi</p></article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl">Pending Leave Approvals</h2>
        <div className="mt-3 overflow-x-auto">
          <table>
            <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Action</th></tr></thead>
            <tbody>
              {pendingLeaves.length ? pendingLeaves.map((leave) => {
                const approve = decideLeaveAction.bind(null, leave.id, "APPROVE");
                const reject = decideLeaveAction.bind(null, leave.id, "REJECT");
                return (
                  <tr key={leave.id}>
                    <td>{leave.employeeId}</td><td>{leave.type}</td><td>{leave.startDate}</td><td>{leave.endDate}</td><td>{leave.totalDays}</td>
                    <td>
                      <div className="action-row">
                        <form action={approve}><button type="submit">Approve</button></form>
                        <form action={reject}><button type="submit" className="danger-btn">Reject</button></form>
                      </div>
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={6}>No pending leave approvals.</td></tr>}
            </tbody>
          </table>
        </div>
        {params.leaveError ? <p className="error-text mt-2">{params.leaveError}</p> : null}
        {params.leaveUpdated ? <p className="success-text mt-2">Leave decision submitted.</p> : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl">Today&apos;s Team Status</h2>
        <div className="mt-3 overflow-x-auto">
          <table>
            <thead><tr><th>Employee</th><th>Punch In</th><th>Punch Out</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {todayRows.length ? todayRows.map((row) => (
                <tr key={`${row.employeeId}-${row.date}`}><td>{row.employeeId}</td><td>{row.punchIn ?? "--"}</td><td>{row.punchOut ?? "--"}</td><td>{row.workHours}</td><td>{row.status}</td></tr>
              )) : <tr><td colSpan={5}>No attendance records available for today.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
