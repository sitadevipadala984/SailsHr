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
```
