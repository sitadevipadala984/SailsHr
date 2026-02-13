import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";

type Attendance = { employeeId: string; status: string; workHours: number };
type LeaveBalance = { employeeId: string; CL: number; SL: number; PL: number };

export default async function EmployeePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "EMPLOYEE") redirect("/");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const [attendanceResponse, balanceResponse] = await Promise.all([
    fetch(`${baseUrl}/api/v1/attendance/today`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/leave-balances`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
  ]);

  const attendanceRows = (await attendanceResponse.json()) as Attendance[];
  const balances = (await balanceResponse.json()) as LeaveBalance[];

  return (
    <main>
      <h1>Employee Dashboard</h1>
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>My Attendance</h2>
        <pre>{JSON.stringify(attendanceRows, null, 2)}</pre>
      </section>
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>My Leave Balance</h2>
        <pre>{JSON.stringify(balances, null, 2)}</pre>
      </section>
    </main>
  );
}
