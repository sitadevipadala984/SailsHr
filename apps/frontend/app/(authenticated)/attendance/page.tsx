import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";
import { AttendanceCalendar } from "./attendance-calendar";

type AttendanceRecord = {
  employeeId: string;
  date: string;
  punchIn?: string;
  punchOut?: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY";
  workHours: number;
};

type LeaveRequest = {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default async function AttendancePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const [meRes, attendanceRes, leavesRes] = await Promise.all([
    fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    }),
    fetch(`${baseUrl}/api/v1/attendance/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    }),
    fetch(`${baseUrl}/api/v1/leaves/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    })
  ]);

  if (!meRes.ok) redirect("/login");

  const me = (await meRes.json()) as { id: string; email: string; role: string; employeeId: string };
  const attendance = (await attendanceRes.json()) as AttendanceRecord[];
  const leaves = (await leavesRes.json()) as LeaveRequest[];

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-semibold text-text-primary">Attendance</h1>
      <AttendanceCalendar
        attendance={attendance}
        leaves={leaves}
        employeeId={me.employeeId}
      />
    </main>
  );
}
