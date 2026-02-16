# SailsHR Internal HRMS POC

Internal HRMS proof-of-concept with **separate services** (not a monolith). Each app is its own deployable; more systems (e.g. employee service) can be added later.

## Project structure (separate apps)

| App | Path | Purpose |
|-----|------|--------|
| **API** (HRMS core) | `apps/api/` | Fastify API: auth, leave, attendance, employees, dashboard |
| **Web** | `apps/frontend/` | Next.js UI (App Router) |
| *(future)* | e.g. `apps/employee-service/` | Separate employee system when you add it |

- **One repo, one install:** from repo root run `npm install` then `npm start` to run API + frontend together.
- **Each app stays separate:** deploy and scale independently; add new services under `apps/` when needed.

## Tech stack

- **Frontend:** Next.js (React 19 + TypeScript, App Router)
- **Backend:** Fastify + TypeScript
- **Database:** MongoDB (API also has PostgreSQL migration scripts)
- **Auth:** JWT + RBAC

## Setup

1. Install dependencies (all workspaces):

```bash
npm install
```

2. Create env files as needed (e.g. `apps/api/` and `apps/frontend/` if they have `.env.example`).

## Run locally

From repo root:

```bash
npm start
```

- **Frontend:** http://localhost:3000  
- **API health:** http://localhost:4000/health  

To run a single app:

```bash
npm run dev -w api      # API only
npm run dev -w frontend # Frontend only
```

## Lint & format

```bash
npm run lint
npm run format        # check
npm run format:write  # fix
```

---

## Delivered: Leave Management (End-to-End)

### Leave APIs

- `POST /api/v1/leaves/apply`
- `POST /api/v1/leaves/:id/decision` (`APPROVE` / `REJECT`)
- `GET /api/v1/leaves/me`
- `GET /api/v1/leaves/pending-approvals`
- `GET /api/v1/leave-balances`

### Workflow rules

- Leave overlap prevention for pending/approved requests.
- Manager/HR/Admin approval path with role checks.
- Leave balance deduction on approval only.
- Insufficient balance blocks apply/approval.

### UI

- Employee: leave apply form + my leave requests + live leave balance.
- Manager: pending leave approvals with approve/reject actions.

---

## Delivered: Employee Management UI

### Frontend pages (Server Components)

- `GET /employees` → Employee list
- `GET /employees/new` → Employee create form
- `GET /employees/:id` → Employee profile
- `GET /employees/:id/edit` → Employee edit form

All under authenticated layout and role-protected.

### CRUD wiring

- List: `GET /api/v1/employees`
- Profile: `GET /api/v1/employees/:id`
- Create: `POST /api/v1/employees`
- Edit: `PATCH /api/v1/employees/:id`
- Delete (Admin only): `DELETE /api/v1/employees/:id`

---

## Adding a new service (e.g. employee system)

1. Create a new app under `apps/`, e.g. `apps/employee-service/`.
2. Add its `package.json` (and code); root `workspaces` already includes `apps/*`, so it will be picked up.
3. Add a script in root `package.json` if you want to run it with `npm start` (e.g. with `concurrently`), or run it with `npm run dev -w <package-name>`.

Each service remains separate and deployable on its own.
