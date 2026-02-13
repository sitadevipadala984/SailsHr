# Database Schema (Ticket 4)

This folder contains PostgreSQL-first DDL migrations for the HRMS core entities.

## Included entities

- `roles`
- `departments`
- `employees`

## Why this schema is CRUD-ready

- Primary keys on all tables (`BIGSERIAL`)
- Unique business keys (`roles.code`, `departments.code`, `employees.employee_code`, `employees.email`)
- Foreign-key relationships for role/department/manager hierarchy
- Operational indexes on employee filtering dimensions (department, role, status, manager, joining date)
- Timestamp columns with `updated_at` trigger support

## Future payroll extension design notes

The employee table includes nullable extension fields:

- `payroll_grade_code`
- `cost_center_code`
- `bank_account_last4`

These allow payroll-linked metadata later without breaking existing employee records.

## Apply migration

```bash
psql "$DATABASE_URL" -f api/db/migrations/001_employee_core.sql
```

## Verify tables

```sql
\dt
\d employees
\d departments
\d roles
```
