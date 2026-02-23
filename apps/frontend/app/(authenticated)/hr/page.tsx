import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card } from "../../../src/components/ui/card";
import { DashboardLayoutSample } from "../../../src/theme/dashboard-layout-sample";
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

  const metrics = [
    { label: "Total Employees", value: String(dashboard.totalEmployees ?? "--") },
    { label: "Present Today", value: String(dashboard.presentToday ?? "--") },
    { label: "Leave Requests", value: String(dashboard.pendingLeaveRequests ?? "--") },
    { label: "Attendance %", value: String(dashboard.attendancePercent ?? "--") }
  ];

  return (
    <main className="space-y-4">
      <div>
        <h1>HR Dashboard</h1>
        <p className="subtitle">Enterprise snapshot with clean cards and subtle hierarchy.</p>
      </div>

      <DashboardLayoutSample metrics={metrics} />

      <Card>
        <h2>Org Snapshot</h2>
        <pre className="mt-4">{JSON.stringify(dashboard, null, 2)}</pre>
      </Card>

      <Card>
        <h2>Employee Directory</h2>
        <pre className="mt-4">{JSON.stringify(employees, null, 2)}</pre>
      </Card>
    </main>
  );
}
