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
  type Employee
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

  if (!email || !password) {
    return reply.status(400).send({ message: "email and password are required" });
  }

  const user = authUsers.find((item) => item.email === email && item.password === password);
  if (!user) {
    return reply.status(401).send({ message: "Invalid credentials" });
  }

  const token = issueToken(user);

  return reply.send({
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: getTtlSeconds(),
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      employeeId: user.employeeId
    }
  });
});

app.get("/api/v1/auth/me", { preHandler: [authenticate] }, async (request, reply) => {
  if (!request.auth) {
    return reply.status(401).send({ message: "Unauthenticated" });
  }

  const currentUser = authUsers.find((item) => item.id === request.auth?.sub);
  if (!currentUser) {
    return reply.status(404).send({ message: "User not found" });
  }

  return reply.send({
    id: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
    employeeId: currentUser.employeeId
  });
});

app.get("/api/v1/overview", { preHandler: [authenticate] }, async (request, reply) => {
  if (!request.auth) {
    return reply.status(401).send({ message: "Unauthenticated" });
  }

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
  if (!record) {
    return reply.status(404).send({ message: "Employee not found" });
  }

  return reply.send(record);
});

app.post<{ Body: EmployeePayload }>("/api/v1/employees", { preHandler: [authenticate, authorize(["HR", "ADMIN"])] }, async (request, reply) => {
  const validation = validateEmployeePayload(request.body ?? {}, "create");
  if (!validation.ok) {
    return reply.status(400).send({ message: validation.message });
  }

  if (employees.some((item) => item.employeeCode === request.body.employeeCode)) {
    return reply.status(409).send({ message: "employeeCode already exists" });
  }

  if (employees.some((item) => item.email === request.body.email)) {
    return reply.status(409).send({ message: "email already exists" });
  }

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
  if (index < 0) {
    return reply.status(404).send({ message: "Employee not found" });
  }

  const validation = validateEmployeePayload(request.body ?? {}, "update");
  if (!validation.ok) {
    return reply.status(400).send({ message: validation.message });
  }

  if (
    request.body.employeeCode &&
    employees.some((item, itemIndex) => itemIndex !== index && item.employeeCode === request.body.employeeCode)
  ) {
    return reply.status(409).send({ message: "employeeCode already exists" });
  }

  if (
    request.body.email &&
    employees.some((item, itemIndex) => itemIndex !== index && item.email === request.body.email)
  ) {
    return reply.status(409).send({ message: "email already exists" });
  }

  employees[index] = mapPayloadToEmployee(employees[index], request.body ?? {});
  return reply.send(employees[index]);
});

app.delete<{ Params: { id: string } }>("/api/v1/employees/:id", { preHandler: [authenticate, authorize(["ADMIN"])] }, async (request, reply) => {
  const index = employees.findIndex((item) => item.id === request.params.id);
  if (index < 0) {
    return reply.status(404).send({ message: "Employee not found" });
  }

  const [removed] = employees.splice(index, 1);
  return reply.send({ deletedId: removed.id });
});

app.get("/api/v1/attendance/today", { preHandler: [authenticate] }, async (request) => {
  if (request.auth?.role === "EMPLOYEE") {
    const actor = authUsers.find((item) => item.id === request.auth?.sub);
    return attendance.filter((row) => row.employeeId === actor?.employeeId);
  }

  return attendance;
});
app.get("/api/v1/leaves", { preHandler: [authenticate] }, async () => leaveRequests);
app.get("/api/v1/leave-balances", { preHandler: [authenticate] }, async (request) => {
  if (request.auth?.role === "EMPLOYEE") {
    const actor = authUsers.find((item) => item.id === request.auth?.sub);
    return leaveBalances.filter((row) => row.employeeId === actor?.employeeId);
  }

  return leaveBalances;
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
      averageHours: Number((attendance.reduce((sum, row) => sum + row.workHours, 0) / attendance.length).toFixed(2))
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
