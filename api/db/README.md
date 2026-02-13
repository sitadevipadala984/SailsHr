# Database Schema

This folder contains PostgreSQL DDL migrations for HRMS core modules.

## Migrations

1. `001_employee_core.sql`
   - `roles`, `departments`, `employees`
2. `002_attendance_core.sql`
   - `attendance_records`

## Attendance acceptance mapping

- One attendance record per day: enforced by `UNIQUE (employee_id, attendance_date)`
- Edge cases documented: see `attendance_rules.md`
- HR review ready: checklist included in `attendance_rules.md`

## Apply migrations

```bash
psql "$DATABASE_URL" -f api/db/migrations/001_employee_core.sql
psql "$DATABASE_URL" -f api/db/migrations/002_attendance_core.sql
```
