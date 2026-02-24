import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";
import { punchInAction, punchOutAction } from "../attendance/actions";
import { applyLeaveAction } from "../leave/actions";

type Attendance = {
  employeeId: string;
  date: string;
  punchInAt?: string;
  punchOutAt?: string;
  punchIn?: string;
  punchOut?: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY";
  workHours: number;
};

type LeaveBalance = { employeeId: string; balance: number; used: number; total: number };
type LeaveRequest = {
  id: string;
  type: "CL" | "SL" | "PL";
  startDate: string;
  endDate: string;
  totalDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const holidays = [
  { date: "2026-03-19", name: "Ugadi" },
  { date: "2026-03-29", name: "Holi" },
  { date: "2026-04-14", name: "Dr. Ambedkar Jayanthi" }
];

export default async function EmployeePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; updated?: string; leaveError?: string; leaveUpdated?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "EMPLOYEE") redirect("/");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const [attendanceResponse, balanceResponse, leavesResponse] = await Promise.all([
    fetch(`${baseUrl}/api/v1/attendance/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/leave-balances`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/leaves/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
  ]);

  const attendanceRows = (await attendanceResponse.json()) as Attendance[];
  const balances = (await balanceResponse.json()) as LeaveBalance[];
  const myLeaves = (await leavesResponse.json()) as LeaveRequest[];
  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = attendanceRows.find((item) => item.date === today);
  const leaveBalance = balances[0];
  const upcomingLeave = myLeaves
    .filter((leave) => leave.startDate >= today && leave.status !== "REJECTED")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const params = await searchParams;

  return (
    <main className="space-y-5">
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today Status</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{todayRecord?.status ?? "ABSENT"}</p>
          <p className="mt-1 text-sm text-slate-600">
            In {todayRecord?.punchIn ?? "--"} · Out {todayRecord?.punchOut ?? "--"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming Leave</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {upcomingLeave ? `${upcomingLeave.type} (${upcomingLeave.totalDays} day)` : "No upcoming leave"}
          </p>
          <p className="mt-1 text-sm text-slate-600">{upcomingLeave ? upcomingLeave.startDate : "Apply for leave to plan ahead."}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" href="/attendance">
              View Attendance
            </Link>
            <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/leave">
              Apply Leave
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Attendance Summary</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{todayRecord?.workHours ?? 0}h</p>
          <p className="mt-1 text-sm text-slate-600">Worked today</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Leave Balance</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{leaveBalance?.balance ?? 0}</p>
          <p className="mt-1 text-sm text-slate-600">Out of {leaveBalance?.total ?? 0} days</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Upcoming Holidays</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {holidays.slice(0, 2).map((holiday) => (
              <li key={holiday.date}>{holiday.date} · {holiday.name}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Payslip Preview</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">Jan 2026</p>
          <p className="mt-1 text-sm text-slate-600">Ready to download</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl">Today&apos;s Attendance</h2>
          <div className="ml-auto flex gap-2">
            <form action={punchInAction}><button type="submit" disabled={Boolean(todayRecord?.punchInAt)}>Punch In</button></form>
            <form action={punchOutAction}><button type="submit" disabled={!todayRecord?.punchInAt || Boolean(todayRecord?.punchOutAt)}>Punch Out</button></form>
          </div>
        </div>
        {params.error ? <p className="error-text mt-2">{params.error}</p> : null}
        {params.updated ? <p className="success-text mt-2">Attendance updated successfully.</p> : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl">Apply Leave</h2>
        <form action={applyLeaveAction} className="form-grid mt-4">
          <label>Leave Type
            <select name="type" required>
              <option value="CL">CL</option>
              <option value="SL">SL</option>
              <option value="PL">PL</option>
            </select>
          </label>
          <label>Start Date<input name="startDate" type="date" required /></label>
          <label>End Date<input name="endDate" type="date" required /></label>
          <label>Reason<input name="reason" placeholder="Optional" /></label>
          <button type="submit">Apply Leave</button>
        </form>
        {params.leaveError ? <p className="error-text mt-2">{params.leaveError}</p> : null}
        {params.leaveUpdated ? <p className="success-text mt-2">Leave request submitted.</p> : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl">Attendance History</h2>
          <div className="mt-3 overflow-x-auto">
            <table>
              <thead><tr><th>Date</th><th>Punch In</th><th>Punch Out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {attendanceRows.map((row) => (
                  <tr key={`${row.employeeId}-${row.date}`}><td>{row.date}</td><td>{row.punchIn ?? "--"}</td><td>{row.punchOut ?? "--"}</td><td>{row.workHours}</td><td>{row.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl">My Leave Requests</h2>
          <div className="mt-3 overflow-x-auto">
            <table>
              <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
              <tbody>
                {myLeaves.map((leave) => (
                  <tr key={leave.id}><td>{leave.type}</td><td>{leave.startDate}</td><td>{leave.endDate}</td><td>{leave.totalDays}</td><td>{leave.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
