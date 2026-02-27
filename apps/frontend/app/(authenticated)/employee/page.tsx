import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";
import { Button } from "../../../components/ui";
import { punchInAction, punchOutAction } from "../attendance/actions";

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
    <main className="space-y-6">
      <section className="grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-sm lg:grid-cols-3">
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Today Status</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{todayRecord?.status ?? "ABSENT"}</p>
          <p className="mt-2 text-sm text-text-secondary">
            In {todayRecord?.punchIn ?? "--"} · Out {todayRecord?.punchOut ?? "--"}
          </p>
        </div>
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Upcoming Leave</p>
          <p className="mt-2 text-lg font-medium text-text-primary">
            {upcomingLeave ? `${upcomingLeave.type} (${upcomingLeave.totalDays} day)` : "No upcoming leave"}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{upcomingLeave ? upcomingLeave.startDate : "Apply for leave to plan ahead."}</p>
        </div>
        <div className="rounded-xl bg-muted p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Quick Actions</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90" href="/attendance">
              View Attendance
            </Link>
            <Link className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-muted" href="/leave">
              Apply Leave
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm text-text-secondary">Attendance Summary</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary">{todayRecord?.workHours ?? 0}h</p>
          <p className="mt-2 text-sm text-text-secondary">Worked today</p>
        </article>

        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm text-text-secondary">Leave Balance</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary">{leaveBalance?.balance ?? 0}</p>
          <p className="mt-2 text-sm text-text-secondary">Out of {leaveBalance?.total ?? 0} days</p>
        </article>

        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm text-text-secondary">Upcoming Holidays</p>
          <ul className="mt-2 space-y-2 text-sm text-text-secondary">
            {holidays.slice(0, 2).map((holiday) => (
              <li key={holiday.date}>{holiday.date} · {holiday.name}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm text-text-secondary">Payslip Preview</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">Jan 2026</p>
          <p className="mt-2 text-sm text-text-secondary">Ready to download</p>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-semibold text-text-primary">Today&apos;s Attendance</h2>
          <div className="ml-auto flex gap-2">
            <form action={punchInAction}><Button type="submit" variant="primary" disabled={Boolean(todayRecord?.punchInAt)}>Punch In</Button></form>
            <form action={punchOutAction}><Button type="submit" variant="primary" disabled={!todayRecord?.punchInAt || Boolean(todayRecord?.punchOutAt)}>Punch Out</Button></form>
          </div>
        </div>
        {params.error ? <p className="error-text mt-4">{params.error}</p> : null}
        {params.updated ? <p className="success-text mt-4">Attendance updated successfully.</p> : null}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-text-primary">Apply Leave</h2>
        <p className="mt-2 text-sm text-text-secondary">Submit and track leave requests from the Leave page.</p>
        <Link
          href="/leave"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Go to Leave →
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary">Attendance History</h2>
          <div className="mt-4 overflow-x-auto">
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

        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary">My Leave Requests</h2>
          <div className="mt-4 overflow-x-auto">
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
