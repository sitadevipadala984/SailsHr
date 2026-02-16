"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type EmployeeFormValues = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  joiningDate: string;
  departmentId: string;
  role: "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN";
  managerId?: string;
  employmentStatus: "ACTIVE" | "EXITED" | "ON_NOTICE";
};

const validate = (payload: EmployeeFormValues): string | null => {
  if (!payload.employeeCode.trim()) return "Employee code is required";
  if (!payload.firstName.trim()) return "First name is required";
  if (!payload.lastName.trim()) return "Last name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return "Valid email is required";
  if (!payload.joiningDate) return "Joining date is required";
  if (!payload.departmentId) return "Department is required";
  if (!payload.role) return "Role is required";
  return null;
};

const parseForm = (formData: FormData): EmployeeFormValues => ({
  employeeCode: String(formData.get("employeeCode") ?? ""),
  firstName: String(formData.get("firstName") ?? ""),
  lastName: String(formData.get("lastName") ?? ""),
  email: String(formData.get("email") ?? ""),
  phone: String(formData.get("phone") ?? "") || undefined,
  joiningDate: String(formData.get("joiningDate") ?? ""),
  departmentId: String(formData.get("departmentId") ?? ""),
  role: String(formData.get("role") ?? "EMPLOYEE") as EmployeeFormValues["role"],
  managerId: String(formData.get("managerId") ?? "") || undefined,
  employmentStatus: String(formData.get("employmentStatus") ?? "ACTIVE") as EmployeeFormValues["employmentStatus"]
});

export async function createEmployeeAction(formData: FormData): Promise<void> {
  const payload = parseForm(formData);
  const error = validate(payload);

  if (error) {
    redirect(`/employees/new?error=${encodeURIComponent(error)}`);
  }

  const token = (await cookies()).get("access_token")?.value;
  const response = await fetch(`${baseUrl}/api/v1/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ message: "Could not create employee" }))) as { message?: string };
    redirect(`/employees/new?error=${encodeURIComponent(body.message ?? "Could not create employee")}`);
  }

  redirect("/employees");
}

export async function updateEmployeeAction(employeeId: string, formData: FormData): Promise<void> {
  const payload = parseForm(formData);
  const error = validate(payload);

  if (error) {
    redirect(`/employees/${employeeId}/edit?error=${encodeURIComponent(error)}`);
  }

  const token = (await cookies()).get("access_token")?.value;
  const response = await fetch(`${baseUrl}/api/v1/employees/${employeeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ message: "Could not update employee" }))) as { message?: string };
    redirect(`/employees/${employeeId}/edit?error=${encodeURIComponent(body.message ?? "Could not update employee")}`);
  }

  redirect(`/employees/${employeeId}`);
}

export async function deleteEmployeeAction(employeeId: string): Promise<void> {
  const token = (await cookies()).get("access_token")?.value;

  const response = await fetch(`${baseUrl}/api/v1/employees/${employeeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    redirect(`/employees/${employeeId}?error=${encodeURIComponent("Delete failed")}`);
  }

  redirect("/employees");
}
