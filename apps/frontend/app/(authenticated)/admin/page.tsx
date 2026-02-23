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
    <main>
      <h1>Admin Console</h1>
      <section className="card mt-4">
        <h2>Departments</h2>
        <pre>{JSON.stringify(departments, null, 2)}</pre>
      </section>
      <section className="card mt-4">
        <h2>Employee Controls</h2>
        <pre>{JSON.stringify(employees, null, 2)}</pre>
      </section>
    </main>
  );
}
