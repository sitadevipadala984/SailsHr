# Attendance Business Rules (Ticket 7)

## Core model

Table: `attendance_records`

- One row per employee per date (`UNIQUE (employee_id, attendance_date)`)
- Punch timestamps are optional to support non-working statuses (holiday/leave/week-off)
- `worked_minutes` is stored as computed effective work duration in minutes

## Punch-in / Punch-out rules

1. Only first valid punch-in is accepted for attendance opening.
2. Punch-out cannot be earlier than punch-in.
3. Missing punch-out keeps status provisional until day close/correction.
4. Manual corrections are tracked via `is_manual_correction` + `correction_note`.

## Work hour calculation rule

`worked_minutes = floor((punch_out_at - punch_in_at) in minutes)`

If either punch is missing, `worked_minutes = 0` until regularized.

## Attendance status logic (default policy)

- `PRESENT` when `worked_minutes >= 480` (8h)
- `HALF_DAY` when `worked_minutes >= 240 AND < 480`
- `ABSENT` when `worked_minutes < 240` and no approved leave/holiday/week-off marker
- `ON_LEAVE` when leave workflow marks day as leave
- `HOLIDAY` and `WEEK_OFF` set by holiday/weekend calendar processors

## Edge cases documented

- Night shifts crossing midnight: day attribution should follow **scheduled shift date**, not raw calendar split.
- Missed punch-out: keep provisional record, allow correction workflow.
- Duplicate device events: de-duplicate by employee + timestamp tolerance window in ingestion layer.
- Timezone handling: store UTC in DB (`TIMESTAMPTZ`), evaluate policy in org timezone (`Asia/Kolkata`).
- Backdated regularization: update existing day row, never create a second row for same date.

## HR sign-off checklist

- [ ] Status thresholds approved by HR
- [ ] Regularization SLA approved
- [ ] Leave/holiday override sequence approved
- [ ] Night shift attribution policy approved

> Schema is ready for HR review/sign-off with configurable thresholds in future policy tables.
