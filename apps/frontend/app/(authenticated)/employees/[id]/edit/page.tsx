import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../../../lib/auth";
import { updateEmployeeAction } from "../../actions";

type Department = { id: string; name: string };
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
  role: "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN";
  status: "ACTIVE" | "EXITED" | "ON_NOTICE";
};

export default async function EditEmployeePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["HR", "ADMIN"].includes(user.role)) redirect("/employees");

  const route = await params;
  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  const [employeeRes, departmentsRes, employeesRes] = await Promise.all([
    fetch(`${baseUrl}/api/v1/employees/${route.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/departments`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/employees`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
  ]);

  if (!employeeRes.ok) redirect("/employees");

  const employee = (await employeeRes.json()) as Employee;
  const departments = (await departmentsRes.json()) as Department[];
  const employees = (await employeesRes.json()) as Employee[];
  const paramsData = await searchParams;
  const updateAction = updateEmployeeAction.bind(null, employee.id);

  return (
    <main>
      <h1>Edit Employee</h1>
      <section className="card mt-4">
        <form action={updateAction} className="form-grid">
          <label>Employee Code<input name="employeeCode" defaultValue={employee.employeeCode} required /></label>
          <label>First Name<input name="firstName" defaultValue={employee.firstName} required /></label>
          <label>Last Name<input name="lastName" defaultValue={employee.lastName} required /></label>
          <label>Email<input name="email" type="email" defaultValue={employee.email} required /></label>
          <label>Phone<input name="phone" defaultValue={employee.phone ?? ""} /></label>
          <label>Joining Date<input name="joiningDate" type="date" defaultValue={employee.joiningDate} required /></label>

          <label>
            Department
            <select name="departmentId" defaultValue={employee.departmentId} required>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>

          <label>
            Role
            <select name="role" defaultValue={employee.role} required>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR">HR</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <label>
            Reporting Manager
            <select name="managerId" defaultValue={employee.managerId ?? ""}>
              <option value="">No Manager</option>
              {employees.filter((item) => item.id !== employee.id).map((record) => (
                <option key={record.id} value={record.id}>{record.fullName}</option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select name="employmentStatus" defaultValue={employee.status}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_NOTICE">ON_NOTICE</option>
              <option value="EXITED">EXITED</option>
            </select>
          </label>

          <button type="submit">Save Changes</button>
        </form>
        {paramsData.error ? <p className="error-text">{paramsData.error}</p> : null}
      </section>
    </main>
  );
}
