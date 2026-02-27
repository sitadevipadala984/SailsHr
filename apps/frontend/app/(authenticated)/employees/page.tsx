import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";
import { Card } from "../../../components/ui";

type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
};

export default async function EmployeeListPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["HR", "ADMIN", "MANAGER"].includes(user.role)) redirect("/");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const response = await fetch(`${baseUrl}/api/v1/employees`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });

  const employees = (await response.json()) as Employee[];

  return (
    <main className="space-y-6">
      <div className="heading-row">
        <h1 className="text-3xl font-semibold text-text-primary">Employee Management</h1>
        {user.role !== "MANAGER" ? <Link href="/employees/new" className="link-btn">Add Employee</Link> : null}
      </div>
      <Card className="mt-6 p-6">
        <table>
          <thead>
            <tr><th>Code</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employeeCode}</td>
                <td>{employee.fullName}</td>
                <td>{employee.email}</td>
                <td>{employee.role}</td>
                <td>{employee.status}</td>
                <td><Link href={`/employees/${employee.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
