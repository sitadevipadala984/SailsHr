import type { AuthUser } from "./auth.js";

export type EmployeeStatus = "ACTIVE" | "EXITED" | "ON_NOTICE";

export type Employee = {
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
  status: EmployeeStatus;
};

export type Department = {
  id: string;
  name: string;
  headId?: string;
};

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY";

export type AttendanceRecord = {
  employeeId: string;
  date: string;
  punchInAt?: string;
  punchOutAt?: string;
  punchIn?: string;
  punchOut?: string;
  status: AttendanceStatus;
  workHours: number;
};

export type LeaveType = "CL" | "SL" | "PL";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approverId?: string;
  decidedAt?: string;
};

export type LeaveBalance = {
  employeeId: string;
  balance: number;
  used: number;
  total: number;
};

/** Granted leave days per employee (total). New employees get this as initial balance. */
export const DEFAULT_LEAVE_GRANTED = 16;

export const departments: Department[] = [
  { id: "dep-hr", name: "HR" },
  { id: "dep-fin", name: "Finance" },
  { id: "dep-cloud", name: "Cloud Delivery" },
  { id: "dep-ops", name: "Operations" },
  { id: "dep-tech", name: "Technical Delivery" },
  { id: "dep-it", name: "IT" },
  { id: "dep-talent", name: "Talent Mobility" }
];

export const employees: Employee[] = [
  // ===== ADMINS (HR) =====
  {
    id: "id-001",
    employeeCode: "SS001",
    firstName: "Kavita",
    lastName: "HR",
    fullName: "Kavita HR",
    email: "kavita@sailshr.local",
    joiningDate: "2022-01-10",
    departmentId: "dep-hr",
    role: "ADMIN",
    status: "ACTIVE"
  },
  {
    id: "id-002",
    employeeCode: "SS002",
    firstName: "Madhuri",
    lastName: "HR",
    fullName: "Madhuri HR",
    email: "madhuri@sailshr.local",
    joiningDate: "2022-03-18",
    departmentId: "dep-hr",
    role: "ADMIN",
    status: "ACTIVE"
  },

  // ===== MANAGERS =====
  {
    id: "id-003",
    employeeCode: "SS003",
    firstName: "Bhanu",
    lastName: "Manager",
    fullName: "Bhanu Manager",
    email: "bhanu@sailshr.local",
    joiningDate: "2021-06-12",
    departmentId: "dep-tech",
    role: "MANAGER",
    status: "ACTIVE"
  },
  {
    id: "id-004",
    employeeCode: "SS004",
    firstName: "Srirag",
    lastName: "Manager",
    fullName: "Srirag Manager",
    email: "srirag@sailshr.local",
    joiningDate: "2021-08-05",
    departmentId: "dep-cloud",
    role: "MANAGER",
    status: "ACTIVE"
  },

  // ===== EMPLOYEES (SITA under managers) =====
  {
    id: "id-005",
    employeeCode: "SS005",
    firstName: "Sita",
    lastName: "Employee",
    fullName: "Sita Padala",
    email: "sita1@sailshr.local",
    joiningDate: "2024-01-15",
    departmentId: "dep-cloud",
    managerId: "id-004",
    role: "EMPLOYEE",
    status: "ACTIVE"
  },
  {
    id: "id-006",
    employeeCode: "SS006",
    firstName: "Sita",
    lastName: "Employee",
    fullName: "Sita (Bhanu)",
    email: "sita2@sailshr.local",
    joiningDate: "2024-02-10",
    departmentId: "dep-tech",
    managerId: "id-003",
    role: "EMPLOYEE",
    status: "ACTIVE"
  },
  {
    id: "id-007",
    employeeCode: "SS007",
    firstName: "Sita",
    lastName: "Employee",
    fullName: "Sita (Srirag)",
    email: "sita3@sailshr.local",
    joiningDate: "2024-03-01",
    departmentId: "dep-cloud",
    managerId: "id-004",
    role: "EMPLOYEE",
    status: "ACTIVE"
  },
  {
    id: "id-008",
    employeeCode: "SS008",
    firstName: "Sita",
    lastName: "Employee",
    fullName: "Sita (Bhanu)",
    email: "sita4@sailshr.local",
    joiningDate: "2024-03-20",
    departmentId: "dep-tech",
    managerId: "id-003",
    role: "EMPLOYEE",
    status: "ACTIVE"
  },
  {
    id: "id-009",
    employeeCode: "SS009",
    firstName: "Sita",
    lastName: "Employee",
    fullName: "Sita (Srirag)",
    email: "sita5@sailshr.local",
    joiningDate: "2024-04-05",
    departmentId: "dep-cloud",
    managerId: "id-004",
    role: "EMPLOYEE",
    status: "ACTIVE"
  },
  {
    id: "id-010",
    employeeCode: "SS010",
    firstName: "Sita",
    lastName: "Employee",
    fullName: "Sita (Srirag)",
    email: "sita6@sailshr.local",
    joiningDate: "2024-04-18",
    departmentId: "dep-cloud",
    managerId: "id-004",
    role: "EMPLOYEE",
    status: "ACTIVE"
  }
];

export const authUsers: AuthUser[] = [
  { id: "AU1", email: "kavita@sailshr.local", password: "Pass@123", role: "ADMIN", employeeId: "id-001" },
  { id: "AU2", email: "madhuri@sailshr.local", password: "Pass@123", role: "ADMIN", employeeId: "id-002" },
  { id: "AU3", email: "bhanu@sailshr.local", password: "Pass@123", role: "MANAGER", employeeId: "id-003" },
  { id: "AU4", email: "srirag@sailshr.local", password: "Pass@123", role: "MANAGER", employeeId: "id-004" },
  { id: "AU5", email: "sita1@sailshr.local", password: "Pass@123", role: "EMPLOYEE", employeeId: "id-005" }
];

export const attendance: AttendanceRecord[] = [
  { employeeId: "id-001", date: "2026-02-10", punchInAt: "2026-02-10T09:00:00.000Z", punchOutAt: "2026-02-10T18:00:00.000Z", punchIn: "09:00", punchOut: "18:00", status: "PRESENT", workHours: 9 },
  { employeeId: "id-003", date: "2026-02-10", punchInAt: "2026-02-10T09:04:00.000Z", punchOutAt: "2026-02-10T18:02:00.000Z", punchIn: "09:04", punchOut: "18:02", status: "PRESENT", workHours: 8.96 },
  { employeeId: "id-004", date: "2026-02-10", punchInAt: "2026-02-10T09:10:00.000Z", punchOutAt: "2026-02-10T18:05:00.000Z", punchIn: "09:10", punchOut: "18:05", status: "PRESENT", workHours: 8.92 },
  { employeeId: "id-005", date: "2026-02-10", punchInAt: "2026-02-10T09:22:00.000Z", punchOutAt: "2026-02-10T18:19:00.000Z", punchIn: "09:22", punchOut: "18:19", status: "PRESENT", workHours: 8.95 },
  { employeeId: "id-006", date: "2026-02-10", punchInAt: "2026-02-10T09:45:00.000Z", punchOutAt: "2026-02-10T14:01:00.000Z", punchIn: "09:45", punchOut: "14:01", status: "HALF_DAY", workHours: 4.27 }
];

export const leaveRequests: LeaveRequest[] = [
  { id: "leave-001", employeeId: "id-005", type: "CL", startDate: "2026-02-14", endDate: "2026-02-14", totalDays: 1, reason: "Personal work", status: "PENDING", approverId: "id-004" },
  { id: "leave-002", employeeId: "id-006", type: "SL", startDate: "2026-02-09", endDate: "2026-02-10", totalDays: 2, reason: "Fever", status: "APPROVED", approverId: "id-003", decidedAt: "2026-02-08T10:30:00.000Z" }
];

export const leaveBalances: LeaveBalance[] = [
  { employeeId: "id-001", balance: 15, used: 1, total: 16 },
  { employeeId: "id-002", balance: 16, used: 0, total: 16 },
  { employeeId: "id-003", balance: 16, used: 0, total: 16 },
  { employeeId: "id-004", balance: 16, used: 0, total: 16 },
  { employeeId: "id-005", balance: 16, used: 0, total: 16 },
  { employeeId: "id-006", balance: 14, used: 2, total: 16 },
  { employeeId: "id-007", balance: 16, used: 0, total: 16 },
  { employeeId: "id-008", balance: 16, used: 0, total: 16 },
  { employeeId: "id-009", balance: 16, used: 0, total: 16 },
  { employeeId: "id-010", balance: 16, used: 0, total: 16 }
];
