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
  const params = await searchParams;

  return (
    <main>
      <h1>Employee Dashboard</h1>

      <section className="card mt-4">
        <h2>Today&apos;s Attendance</h2>
        <p className="subtitle">Status: <strong>{todayRecord?.status ?? "ABSENT"}</strong></p>
        <p>
          Punch In: {todayRecord?.punchIn ?? "--"} | Punch Out: {todayRecord?.punchOut ?? "--"} | Hours: {todayRecord?.workHours ?? 0}
        </p>
        <div className="action-row mt-2">
          <form action={punchInAction}><button type="submit" disabled={Boolean(todayRecord?.punchInAt)}>Punch In</button></form>
          <form action={punchOutAction}><button type="submit" disabled={!todayRecord?.punchInAt || Boolean(todayRecord?.punchOutAt)}>Punch Out</button></form>
        </div>
        {params.error ? <p className="error-text">{params.error}</p> : null}
        {params.updated ? <p className="success-text">Attendance updated successfully.</p> : null}
      </section>

      <section className="card mt-4">
        <h2>Attendance History</h2>
        <table>
          <thead><tr><th>Date</th><th>Punch In</th><th>Punch Out</th><th>Hours</th><th>Status</th></tr></thead>
          <tbody>
            {attendanceRows.map((row) => (
              <tr key={`${row.employeeId}-${row.date}`}><td>{row.date}</td><td>{row.punchIn ?? "--"}</td><td>{row.punchOut ?? "--"}</td><td>{row.workHours}</td><td>{row.status}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card mt-4">
        <h2>Apply Leave</h2>
        <form action={applyLeaveAction} className="form-grid">
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
        {params.leaveError ? <p className="error-text">{params.leaveError}</p> : null}
        {params.leaveUpdated ? <p className="success-text">Leave request submitted.</p> : null}
      </section>

      <section className="card mt-4">
        <h2>My Leave Requests</h2>
        <table>
          <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
          <tbody>
            {myLeaves.map((leave) => (
              <tr key={leave.id}><td>{leave.type}</td><td>{leave.startDate}</td><td>{leave.endDate}</td><td>{leave.totalDays}</td><td>{leave.status}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card mt-4">
        <h2>My Leave Balance</h2>
        <table>
          <thead><tr><th>Balance</th><th>Used</th><th>Total</th></tr></thead>
          <tbody>{balances.map((row) => (<tr key={row.employeeId}><td>{row.balance}</td><td>{row.used}</td><td>{row.total}</td></tr>))}</tbody>
        </table>
      </section>
    </main>
  );
}
