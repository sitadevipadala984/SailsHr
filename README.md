# SailsHR Internal HRMS POC

## Delivered in this ticket: Leave Management (End-to-End)

### Leave APIs
- `POST /api/v1/leaves/apply`
- `POST /api/v1/leaves/:id/decision` (`APPROVE` / `REJECT`)
- `GET /api/v1/leaves/me`
- `GET /api/v1/leaves/pending-approvals`
- `GET /api/v1/leave-balances`

### Workflow rules implemented
- Leave overlap prevention for pending/approved requests.
- Manager/HR/Admin approval path with role checks.
- Leave balance deduction on approval only.
- Insufficient balance blocks apply/approval.

### UI implemented
- Employee: leave apply form + my leave requests + live leave balance.
- Manager: pending leave approvals with approve/reject actions.
## Delivered in this ticket: Employee Management UI

### Frontend pages (Server Components)
- `GET /employees` → Employee list page with server-side data fetch
- `GET /employees/new` → Employee create form
- `GET /employees/:id` → Employee profile page
- `GET /employees/:id/edit` → Employee edit form

All pages are under authenticated layout and protected by role.

### Validation & form handling
- Create/edit forms use server actions with validation for required fields and email format.
- Validation and API errors are shown through query-string error messaging.

### CRUD wiring
- List: fetches from `GET /api/v1/employees`
- Profile: fetches from `GET /api/v1/employees/:id`
- Create: submits to `POST /api/v1/employees`
- Edit: submits to `PATCH /api/v1/employees/:id`
- Delete (Admin only): submits to `DELETE /api/v1/employees/:id`

### Backend support added
- New employee CRUD endpoints with role guards and payload validation in Fastify.

## Local run

```bash
# API
cd api
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
# SailsHR Monorepo

Initial bootstrap for internal HRMS MVP.

## Tech Stack

- Frontend: Next.js (React 19 + TypeScript, App Router)
- Backend: Fastify + TypeScript
- Database: MongoDB
- Auth model target: JWT + RBAC

## Project Structure

```txt
apps/
  frontend/   # Next.js app (App Router)
  backend/    # Fastify API
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env files:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
```

## Run locally

Run both frontend and backend:

```bash
npm start
```

- Frontend: http://localhost:3000
- Backend health check: http://localhost:4000/health

## Lint

```bash
npm run lint
```
