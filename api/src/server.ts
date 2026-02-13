import Fastify from "fastify";
import cors from "@fastify/cors";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getTtlSeconds, issueToken, verifyToken, type JwtPayload, type UserRole } from "./auth.js";
import {
  attendance,
  authUsers,
  departments,
  employees,
  leaveBalances,
  leaveRequests,
  type Employee,
  type AttendanceRecord,
  type AttendanceStatus,
  type LeaveType,
  type LeaveRequest
} from "./data.js";

type LoginBody = {
  email: string;
  password: string;
};

type EmployeePayload = {
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  joiningDate?: string;
  departmentId?: string;
  role?: Employee["role"];
  managerId?: string;
  employmentStatus?: Employee["status"];
};

type LeaveApplyBody = {
  type?: LeaveType;
  startDate?: string;
  endDate?: string;
  reason?: string;
};

type LeaveDecisionBody = {
  action?: "APPROVE" | "REJECT";
};

declare module "fastify" {
  interface FastifyRequest {
    auth?: JwtPayload;
  }
}

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 4000);

await app.register(cors, { origin: true });

const readBearer = (request: FastifyRequest): string | null => {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice(7);
};

const authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const token = readBearer(request);
  if (!token) {
    reply.status(401).send({ message: "Missing bearer token" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    reply.status(401).send({ message: "Token invalid or expired" });
    return;
  }

  request.auth = payload;
};

const authorize =
  (roles: UserRole[]) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.auth) {
      reply.status(401).send({ message: "Unauthenticated" });
      return;
    }

    if (!roles.includes(request.auth.role)) {
      reply.status(403).send({ message: `Role ${request.auth.role} cannot access this resource` });
    }
  };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const statusFromHours = (workHours: number): AttendanceStatus => {
  if (workHours >= 8) return "PRESENT";
  if (workHours >= 4) return "HALF_DAY";
  return "ABSENT";
};

const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);
const toTimeLabel = (date: Date): string => date.toISOString().slice(11, 16);
const getActor = (request: FastifyRequest) => authUsers.find((item) => item.id === request.auth?.sub);

const computeWorkHours = (punchInAt: string, punchOutAt: string): number => {
  const inAt = new Date(punchInAt);
  const outAt = new Date(punchOutAt);
  const diffHours = (outAt.getTime() - inAt.getTime()) / (1000 * 60 * 60);
  return Number(Math.max(0, diffHours).toFixed(2));
};

const daysInclusive = (startDate: string, endDate: string): number => {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean =>
  new Date(aStart) <= new Date(bEnd) && new Date(bStart) <= new Date(aEnd);

const validateEmployeePayload = (
  payload: EmployeePayload,
  mode: "create" | "update"
): { ok: true } | { ok: false; message: string } => {
  const requiredFields: (keyof EmployeePayload)[] = [
    "employeeCode",
    "firstName",
    "lastName",
    "email",
    "joiningDate",
    "departmentId",
    "role"
  ];

  if (mode === "create") {
    const missing = requiredFields.find((field) => !payload[field]);
    if (missing) {
      return { ok: false, message: `${missing} is required` };
    }
  }

  if (payload.email && !emailRegex.test(payload.email)) {
    return { ok: false, message: "email format is invalid" };
  }

  if (payload.departmentId && !departments.some((item) => item.id === payload.departmentId)) {
    return { ok: false, message: "departmentId is invalid" };
  }

  if (payload.managerId && !employees.some((item) => item.id === payload.managerId)) {
    return { ok: false, message: "managerId is invalid" };
  }

  return { ok: true };
};

const mapPayloadToEmployee = (target: Employee, payload: EmployeePayload): Employee => ({
  ...target,
  employeeCode: payload.employeeCode ?? target.employeeCode,
  firstName: payload.firstName ?? target.firstName,
  lastName: payload.lastName ?? target.lastName,
  fullName: `${payload.firstName ?? target.firstName} ${payload.lastName ?? target.lastName}`,
  email: payload.email ?? target.email,
  phone: payload.phone ?? target.phone,
  joiningDate: payload.joiningDate ?? target.joiningDate,
  departmentId: payload.departmentId ?? target.departmentId,
  managerId: payload.managerId ?? target.managerId,
  role: payload.role ?? target.role,
  status: payload.employmentStatus ?? target.status
});

app.get("/health", async () => ({ status: "ok" }));

app.post<{ Body: LoginBody }>("/api/v1/auth/login", async (request, reply) => {
  const { email, password } = request.body ?? {};
  if (!email || !password) return reply.status(400).send({ message: "email and password are required" });

  const user = authUsers.find((item) => item.email === email && item.password === password);
  if (!user) return reply.status(401).send({ message: "Invalid credentials" });

  const token = issueToken(user);
  return reply.send({
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: getTtlSeconds(),
    user: { id: user.id, role: user.role, email: user.email, employeeId: user.employeeId }
  });
});

app.get("/api/v1/auth/me", { preHandler: [authenticate] }, async (request, reply) => {
  if (!request.auth) return reply.status(401).send({ message: "Unauthenticated" });

  const currentUser = authUsers.find((item) => item.id === request.auth?.sub);
  if (!currentUser) return reply.status(404).send({ message: "User not found" });

  return reply.send({
    id: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
    employeeId: currentUser.employeeId
  });
});

app.get("/api/v1/overview", { preHandler: [authenticate] }, async (request, reply) => {
  if (!request.auth) return reply.status(401).send({ message: "Unauthenticated" });

  return reply.send({
    product: "Internal HRMS POC",
    targetEmployees: 500,
    scope: ["HR Core", "Attendance", "Leave Management"],
    excluded: ["Payroll", "Statutory Compliance", "Biometric Integration"],
    metrics: {
      employeesConfigured: employees.length,
      pendingLeaveApprovals: leaveRequests.filter((item) => item.status === "PENDING").length,
      activeDepartments: departments.length
    }
  });
});

app.get("/api/v1/departments", { preHandler: [authenticate, authorize(["HR", "ADMIN"])] }, async () => departments);
app.get("/api/v1/employees", { preHandler: [authenticate, authorize(["HR", "ADMIN", "MANAGER"])] }, async () => employees);
app.get<{ Params: { id: string } }>("/api/v1/employees/:id", { preHandler: [authenticate, authorize(["HR", "ADMIN", "MANAGER"])] }, async (request, reply) => {
  const record = employees.find((item) => item.id === request.params.id);
  if (!record) return reply.status(404).send({ message: "Employee not found" });
  return reply.send(record);
});

app.post<{ Body: EmployeePayload }>("/api/v1/employees", { preHandler: [authenticate, authorize(["HR", "ADMIN"])] }, async (request, reply) => {
  const validation = validateEmployeePayload(request.body ?? {}, "create");
  if (!validation.ok) return reply.status(400).send({ message: validation.message });

  if (employees.some((item) => item.employeeCode === request.body.employeeCode)) return reply.status(409).send({ message: "employeeCode already exists" });
  if (employees.some((item) => item.email === request.body.email)) return reply.status(409).send({ message: "email already exists" });

  const firstName = request.body.firstName as string;
  const lastName = request.body.lastName as string;
  const created: Employee = {
    id: `emp-${String(employees.length + 1).padStart(3, "0")}`,
    employeeCode: request.body.employeeCode as string,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: request.body.email as string,
    phone: request.body.phone,
    joiningDate: request.body.joiningDate as string,
    departmentId: request.body.departmentId as string,
    managerId: request.body.managerId,
    role: request.body.role as Employee["role"],
    status: request.body.employmentStatus ?? "ACTIVE"
  };

  employees.push(created);
  return reply.status(201).send(created);
});

app.patch<{ Params: { id: string }; Body: EmployeePayload }>("/api/v1/employees/:id", { preHandler: [authenticate, authorize(["HR", "ADMIN"])] }, async (request, reply) => {
  const index = employees.findIndex((item) => item.id === request.params.id);
  if (index < 0) return reply.status(404).send({ message: "Employee not found" });

  const validation = validateEmployeePayload(request.body ?? {}, "update");
  if (!validation.ok) return reply.status(400).send({ message: validation.message });

  if (request.body.employeeCode && employees.some((item, itemIndex) => itemIndex !== index && item.employeeCode === request.body.employeeCode)) {
    return reply.status(409).send({ message: "employeeCode already exists" });
  }
  if (request.body.email && employees.some((item, itemIndex) => itemIndex !== index && item.email === request.body.email)) {
    return reply.status(409).send({ message: "email already exists" });
  }

  employees[index] = mapPayloadToEmployee(employees[index], request.body ?? {});
  return reply.send(employees[index]);
});

app.delete<{ Params: { id: string } }>("/api/v1/employees/:id", { preHandler: [authenticate, authorize(["ADMIN"])] }, async (request, reply) => {
  const index = employees.findIndex((item) => item.id === request.params.id);
  if (index < 0) return reply.status(404).send({ message: "Employee not found" });

  const [removed] = employees.splice(index, 1);
  return reply.send({ deletedId: removed.id });
});

app.post("/api/v1/attendance/punch-in", { preHandler: [authenticate] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });

  const now = new Date();
  const dateKey = toDateKey(now);
  const existing = attendance.find((item) => item.employeeId === actor.employeeId && item.date === dateKey);

  if (existing?.punchInAt) return reply.status(409).send({ message: "Duplicate punch-in is not allowed" });

  if (existing) {
    existing.punchInAt = now.toISOString();
    existing.punchIn = toTimeLabel(now);
    existing.status = "ABSENT";
    existing.workHours = 0;
    return reply.send(existing);
  }

  const record: AttendanceRecord = {
    employeeId: actor.employeeId,
    date: dateKey,
    punchInAt: now.toISOString(),
    punchIn: toTimeLabel(now),
    status: "ABSENT",
    workHours: 0
  };
  attendance.push(record);
  return reply.status(201).send(record);
});

app.post("/api/v1/attendance/punch-out", { preHandler: [authenticate] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });

  const now = new Date();
  const dateKey = toDateKey(now);
  const existing = attendance.find((item) => item.employeeId === actor.employeeId && item.date === dateKey);

  if (!existing || !existing.punchInAt) return reply.status(400).send({ message: "Punch-in is required before punch-out" });
  if (existing.punchOutAt) return reply.status(409).send({ message: "Duplicate punch-out is not allowed" });
  if (new Date(existing.punchInAt).getTime() > now.getTime()) return reply.status(400).send({ message: "Punch-out cannot be earlier than punch-in" });

  existing.punchOutAt = now.toISOString();
  existing.punchOut = toTimeLabel(now);
  existing.workHours = computeWorkHours(existing.punchInAt, existing.punchOutAt);
  existing.status = statusFromHours(existing.workHours);
  return reply.send(existing);
});

app.get("/api/v1/attendance/me", { preHandler: [authenticate] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });

  return reply.send(attendance.filter((item) => item.employeeId === actor.employeeId).sort((a, b) => b.date.localeCompare(a.date)));
});

app.get("/api/v1/attendance/team", { preHandler: [authenticate, authorize(["MANAGER", "HR", "ADMIN"])] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });

  const teamMemberIds = employees.filter((item) => item.managerId === actor.employeeId).map((item) => item.id);
  if (request.auth?.role === "MANAGER") return reply.send(attendance.filter((item) => teamMemberIds.includes(item.employeeId)));
  return reply.send(attendance);
});

app.get("/api/v1/leaves", { preHandler: [authenticate] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });

  if (request.auth?.role === "EMPLOYEE") {
    return reply.send(leaveRequests.filter((item) => item.employeeId === actor.employeeId));
  }

  return reply.send(leaveRequests);
});

app.get("/api/v1/leaves/me", { preHandler: [authenticate] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });
  return reply.send(leaveRequests.filter((item) => item.employeeId === actor.employeeId));
});

app.get("/api/v1/leaves/pending-approvals", { preHandler: [authenticate, authorize(["MANAGER", "HR", "ADMIN"])] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });

  if (request.auth?.role === "MANAGER") {
    return reply.send(leaveRequests.filter((item) => item.status === "PENDING" && item.approverId === actor.employeeId));
  }

  return reply.send(leaveRequests.filter((item) => item.status === "PENDING"));
});

app.post<{ Body: LeaveApplyBody }>("/api/v1/leaves/apply", { preHandler: [authenticate] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });

  const { type, startDate, endDate, reason } = request.body ?? {};
  if (!type || !startDate || !endDate) {
    return reply.status(400).send({ message: "type, startDate and endDate are required" });
  }

  const totalDays = daysInclusive(startDate, endDate);
  if (totalDays <= 0) {
    return reply.status(400).send({ message: "endDate must be on or after startDate" });
  }

  const overlap = leaveRequests.some((item) =>
    item.employeeId === actor.employeeId &&
    ["PENDING", "APPROVED"].includes(item.status) &&
    overlaps(startDate, endDate, item.startDate, item.endDate)
  );
  if (overlap) {
    return reply.status(409).send({ message: "Leave overlap detected for selected dates" });
  }

  const balance = leaveBalances.find((item) => item.employeeId === actor.employeeId);
  if (!balance) {
    return reply.status(404).send({ message: "Leave balance not found" });
  }

  if (balance[type] < totalDays) {
    return reply.status(400).send({ message: `Insufficient ${type} balance` });
  }

  const employee = employees.find((item) => item.id === actor.employeeId);
  const leave: LeaveRequest = {
    id: `leave-${String(leaveRequests.length + 1).padStart(3, "0")}`,
    employeeId: actor.employeeId,
    type,
    startDate,
    endDate,
    totalDays,
    reason,
    status: "PENDING",
    approverId: employee?.managerId
  };

  leaveRequests.push(leave);
  return reply.status(201).send(leave);
});

app.post<{ Params: { id: string }; Body: LeaveDecisionBody }>("/api/v1/leaves/:id/decision", { preHandler: [authenticate, authorize(["MANAGER", "HR", "ADMIN"])] }, async (request, reply) => {
  const actor = getActor(request);
  if (!actor) return reply.status(404).send({ message: "Actor not found" });

  const leave = leaveRequests.find((item) => item.id === request.params.id);
  if (!leave) return reply.status(404).send({ message: "Leave request not found" });
  if (leave.status !== "PENDING") return reply.status(400).send({ message: "Only pending leave can be decided" });

  const action = request.body?.action;
  if (!action || !["APPROVE", "REJECT"].includes(action)) {
    return reply.status(400).send({ message: "action must be APPROVE or REJECT" });
  }

  if (request.auth?.role === "MANAGER" && leave.approverId !== actor.employeeId) {
    return reply.status(403).send({ message: "Manager cannot decide leaves outside reporting line" });
  }

  if (action === "APPROVE") {
    const balance = leaveBalances.find((item) => item.employeeId === leave.employeeId);
    if (!balance) return reply.status(404).send({ message: "Leave balance not found" });

    if (balance[leave.type] < leave.totalDays) {
      return reply.status(400).send({ message: `Insufficient ${leave.type} balance for approval` });
    }

    balance[leave.type] -= leave.totalDays;
    leave.status = "APPROVED";
  } else {
    leave.status = "REJECTED";
  }

  leave.approverId = actor.employeeId;
  leave.decidedAt = new Date().toISOString();
  return reply.send(leave);
});

app.get("/api/v1/leave-balances", { preHandler: [authenticate] }, async (request) => {
  if (request.auth?.role === "EMPLOYEE") {
    const actor = getActor(request);
    return leaveBalances.filter((row) => row.employeeId === actor?.employeeId);
  }

  return leaveBalances;
});

app.get("/api/v1/attendance/today", { preHandler: [authenticate] }, async (request) => {
  if (request.auth?.role === "EMPLOYEE") {
    const actor = getActor(request);
    return attendance.filter((row) => row.employeeId === actor?.employeeId);
  }
  return attendance;
});

app.get("/api/v1/dashboard/hr", { preHandler: [authenticate, authorize(["HR", "ADMIN"])] }, async () => {
  const presentCount = attendance.filter((item) => item.status === "PRESENT").length;
  const absentCount = attendance.filter((item) => item.status === "ABSENT").length;
  const halfDayCount = attendance.filter((item) => item.status === "HALF_DAY").length;

  return {
    workforce: {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((item) => item.status === "ACTIVE").length,
      exitedEmployees: employees.filter((item) => item.status === "EXITED").length
    },
    attendance: {
      presentCount,
      absentCount,
      halfDayCount,
      averageHours: Number((attendance.reduce((sum, row) => sum + row.workHours, 0) / Math.max(attendance.length, 1)).toFixed(2))
    },
    leave: {
      pending: leaveRequests.filter((item) => item.status === "PENDING").length,
      approved: leaveRequests.filter((item) => item.status === "APPROVED").length,
      rejected: leaveRequests.filter((item) => item.status === "REJECTED").length
    }
  };
});

const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
