BEGIN;

CREATE TABLE IF NOT EXISTS attendance_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  punch_in_at TIMESTAMPTZ,
  punch_out_at TIMESTAMPTZ,
  source VARCHAR(20) NOT NULL DEFAULT 'WEB',
  status VARCHAR(20) NOT NULL DEFAULT 'ABSENT',
  worked_minutes INTEGER NOT NULL DEFAULT 0,
  is_manual_correction BOOLEAN NOT NULL DEFAULT FALSE,
  correction_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT attendance_one_record_per_day UNIQUE (employee_id, attendance_date),
  CONSTRAINT attendance_status_ck CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'WEEK_OFF', 'HOLIDAY', 'ON_LEAVE')),
  CONSTRAINT attendance_worked_minutes_ck CHECK (worked_minutes >= 0),
  CONSTRAINT attendance_punch_order_ck CHECK (
    punch_out_at IS NULL OR punch_in_at IS NULL OR punch_out_at >= punch_in_at
  )
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance_records(employee_id, attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_status_date ON attendance_records(status, attendance_date DESC);

-- Reuse shared trigger function from previous migration if available.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    DROP TRIGGER IF EXISTS trg_attendance_updated_at ON attendance_records;
    CREATE TRIGGER trg_attendance_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;

COMMIT;
