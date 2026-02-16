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
  CL: number;
  SL: number;
  PL: number;
};

export const departments: Department[] = [
  { id: "dep-eng", name: "Engineering", headId: "emp-002" },
  { id: "dep-hr", name: "Human Resources", headId: "emp-004" },
  { id: "dep-fin", name: "Finance", headId: "emp-005" }
];

export const employees: Employee[] = [
  {
    id: "emp-001",
    employeeCode: "SAIL-001",
    firstName: "Aarav",
    lastName: "Mehta",
    fullName: "Aarav Mehta",
    email: "aarav.mehta@sailshr.local",
    phone: "+919901122334",
    joiningDate: "2024-04-10",
    departmentId: "dep-eng",
    managerId: "emp-002",
    role: "EMPLOYEE",
    status: "ACTIVE"
  },
  {
    id: "emp-002",
    employeeCode: "SAIL-002",
    firstName: "Ishita",
    lastName: "Sharma",
    fullName: "Ishita Sharma",
    email: "ishita.sharma@sailshr.local",
    phone: "+919876123456",
    joiningDate: "2023-02-06",
    departmentId: "dep-eng",
    role: "MANAGER",
    status: "ACTIVE"
  },
  {
    id: "emp-003",
    employeeCode: "SAIL-003",
    firstName: "Rohan",
    lastName: "Nair",
    fullName: "Rohan Nair",
    email: "rohan.nair@sailshr.local",
    phone: "+919845551212",
    joiningDate: "2025-01-19",
    departmentId: "dep-fin",
    managerId: "emp-005",
    role: "EMPLOYEE",
    status: "ACTIVE"
  },
  {
    id: "emp-004",
    employeeCode: "SAIL-004",
    firstName: "Neha",
    lastName: "Bansal",
    fullName: "Neha Bansal",
    email: "neha.bansal@sailshr.local",
    joiningDate: "2022-09-01",
    departmentId: "dep-hr",
    role: "HR",
    status: "ACTIVE"
  },
  {
    id: "emp-005",
    employeeCode: "SAIL-005",
    firstName: "Kabir",
    lastName: "Joshi",
    fullName: "Kabir Joshi",
    email: "kabir.joshi@sailshr.local",
    joiningDate: "2021-11-12",
    departmentId: "dep-fin",
    role: "MANAGER",
    status: "ACTIVE"
  },
  {
    id: "emp-999",
    employeeCode: "SAIL-999",
    firstName: "Admin",
    lastName: "User",
    fullName: "Admin User",
    email: "admin@sailshr.local",
    joiningDate: "2020-01-01",
    departmentId: "dep-hr",
    role: "ADMIN",
    status: "ACTIVE"
  }
];

export const authUsers: AuthUser[] = [
  { id: "usr-001", email: "employee@sailshr.local", password: "Pass@123", role: "EMPLOYEE", employeeId: "emp-001" },
  { id: "usr-002", email: "manager@sailshr.local", password: "Pass@123", role: "MANAGER", employeeId: "emp-002" },
  { id: "usr-003", email: "hr@sailshr.local", password: "Pass@123", role: "HR", employeeId: "emp-004" },
  { id: "usr-004", email: "admin@sailshr.local", password: "Pass@123", role: "ADMIN", employeeId: "emp-999" }
];

export const attendance: AttendanceRecord[] = [
  {
    employeeId: "emp-001",
    date: "2026-02-10",
    punchInAt: "2026-02-10T09:22:00.000Z",
    punchOutAt: "2026-02-10T18:19:00.000Z",
    punchIn: "09:22",
    punchOut: "18:19",
    status: "PRESENT",
    workHours: 8.95
  },
  {
    employeeId: "emp-002",
    date: "2026-02-10",
    punchInAt: "2026-02-10T09:04:00.000Z",
    punchOutAt: "2026-02-10T18:02:00.000Z",
    punchIn: "09:04",
    punchOut: "18:02",
    status: "PRESENT",
    workHours: 8.96
  },
  {
    employeeId: "emp-003",
    date: "2026-02-10",
    punchInAt: "2026-02-10T09:45:00.000Z",
    punchOutAt: "2026-02-10T14:01:00.000Z",
    punchIn: "09:45",
    punchOut: "14:01",
    status: "HALF_DAY",
    workHours: 4.27
  }
];

export const leaveRequests: LeaveRequest[] = [
  {
    id: "leave-001",
    employeeId: "emp-001",
    type: "CL",
    startDate: "2026-02-14",
    endDate: "2026-02-14",
    totalDays: 1,
    reason: "Personal work",
    status: "PENDING",
    approverId: "emp-002"
  },
  {
    id: "leave-002",
    employeeId: "emp-003",
    type: "SL",
    startDate: "2026-02-09",
    endDate: "2026-02-10",
    totalDays: 2,
    reason: "Fever",
    status: "APPROVED",
    approverId: "emp-005",
    decidedAt: "2026-02-08T10:30:00.000Z"
  }
];

export const leaveBalances: LeaveBalance[] = [
  { employeeId: "emp-001", CL: 5, SL: 6, PL: 12 },
  { employeeId: "emp-002", CL: 7, SL: 6, PL: 13 },
  { employeeId: "emp-003", CL: 4, SL: 4, PL: 10 },
  { employeeId: "emp-004", CL: 6, SL: 6, PL: 14 },
  { employeeId: "emp-005", CL: 3, SL: 5, PL: 11 },
  { employeeId: "emp-999", CL: 10, SL: 10, PL: 20 }
];
