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
    <main>
      <h1>HR Dashboard</h1>
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Org Snapshot</h2>
        <pre>{JSON.stringify(dashboard, null, 2)}</pre>
      </section>
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Employee Directory</h2>
        <pre>{JSON.stringify(employees, null, 2)}</pre>
      </section>
    </main>
  );
}
