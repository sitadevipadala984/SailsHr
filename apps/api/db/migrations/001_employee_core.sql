BEGIN;

CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  parent_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  employee_code VARCHAR(32) NOT NULL UNIQUE,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(20),
  joining_date DATE NOT NULL,
  exit_date DATE,
  employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  date_of_birth DATE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  role_id BIGINT NOT NULL REFERENCES roles(id),
  manager_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
  -- Future payroll extension hooks (nullable now, no payroll module coupling yet)
  payroll_grade_code VARCHAR(24),
  cost_center_code VARCHAR(24),
  bank_account_last4 VARCHAR(4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT employees_status_ck CHECK (employment_status IN ('ACTIVE', 'EXITED', 'ON_NOTICE')),
  CONSTRAINT employees_exit_date_ck CHECK (exit_date IS NULL OR exit_date >= joining_date)
);

CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_role_id ON employees(role_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_joining_date ON employees(joining_date);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO roles (code, name, description)
VALUES
  ('EMPLOYEE', 'Employee', 'Default employee access'),
  ('MANAGER', 'Manager', 'Manages team attendance and leave approvals'),
  ('HR', 'HR', 'Human resources operations role'),
  ('ADMIN', 'Admin', 'System administration role')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (code, name)
VALUES
  ('ENG', 'Engineering'),
  ('HR', 'Human Resources'),
  ('FIN', 'Finance')
ON CONFLICT (code) DO NOTHING;

COMMIT;
