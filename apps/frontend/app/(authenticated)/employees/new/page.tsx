import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../../lib/auth";
import { Button, Card, Input, Select } from "../../../../components/ui";
import { createEmployeeAction } from "../actions";

type Department = { id: string; name: string };
type Employee = { id: string; fullName: string };

export default async function NewEmployeePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["HR", "ADMIN"].includes(user.role)) redirect("/employees");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const [departmentsRes, employeesRes] = await Promise.all([
    fetch(`${baseUrl}/api/v1/departments`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/employees`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
  ]);

  const departments = (await departmentsRes.json()) as Department[];
  const employees = (await employeesRes.json()) as Employee[];
  const params = await searchParams;

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-semibold text-text-primary">Create Employee</h1>
      <Card className="mt-6 p-6">
        <form action={createEmployeeAction} className="form-grid">
          <label>Employee Code<Input name="employeeCode" required /></label>
          <label>First Name<Input name="firstName" required /></label>
          <label>Last Name<Input name="lastName" required /></label>
          <label>Email<Input name="email" type="email" required /></label>
          <label>Phone<Input name="phone" /></label>
          <label>Joining Date<Input name="joiningDate" type="date" required /></label>

          <label>
            Department
            <Select name="departmentId" required>
              <option value="">Select department</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </Select>
          </label>

          <label>
            Role
            <Select name="role" required>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR">HR</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </label>

          <label>
            Reporting Manager
            <Select name="managerId">
              <option value="">No Manager</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
            </Select>
          </label>

          <label>
            Status
            <Select name="employmentStatus" defaultValue="ACTIVE">
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_NOTICE">ON_NOTICE</option>
              <option value="EXITED">EXITED</option>
            </Select>
          </label>

          <Button type="submit" variant="primary">Create Employee</Button>
        </form>
        {params.error ? <p className="error-text">{params.error}</p> : null}
      </Card>
    </main>
  );
}
