# SailsHR Internal HRMS POC

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
```
