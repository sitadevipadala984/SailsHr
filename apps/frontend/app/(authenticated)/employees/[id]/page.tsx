import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../../lib/auth";
import { deleteEmployeeAction } from "../actions";

type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  joiningDate: string;
  departmentId: string;
  managerId?: string;
  role: string;
  status: string;
};

export default async function EmployeeProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["HR", "ADMIN", "MANAGER"].includes(user.role)) redirect("/");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const route = await params;

  const response = await fetch(`${baseUrl}/api/v1/employees/${route.id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });

  if (!response.ok) {
    redirect("/employees");
  }

  const employee = (await response.json()) as Employee;
  const errors = await searchParams;
  const deleteAction = deleteEmployeeAction.bind(null, employee.id);

  return (
    <main>
      <div className="heading-row">
        <h1>Employee Profile</h1>
        <div className="action-row">
          {user.role !== "MANAGER" ? <Link href={`/employees/${employee.id}/edit`} className="link-btn">Edit</Link> : null}
          {user.role === "ADMIN" ? <form action={deleteAction}><button type="submit" className="danger-btn">Delete</button></form> : null}
        </div>
      </div>
      <section className="card mt-4">
        <p><strong>Code:</strong> {employee.employeeCode}</p>
        <p><strong>Name:</strong> {employee.fullName}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Phone:</strong> {employee.phone ?? "-"}</p>
        <p><strong>Joining:</strong> {employee.joiningDate}</p>
        <p><strong>Department:</strong> {employee.departmentId}</p>
        <p><strong>Role:</strong> {employee.role}</p>
        <p><strong>Status:</strong> {employee.status}</p>
      </section>
      {errors.error ? <p className="error-text">{errors.error}</p> : null}
    </main>
  );
}
