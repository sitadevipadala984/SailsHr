# Copilot Instructions for SailsHr

## Repository Structure

- **apps/api**: TypeScript backend using Sails.js
  - `src/server.ts` - Server entry point
  - `src/auth.ts` - Authentication logic
  - `src/data.ts` - Data access layer
  - `db/migrations/` - SQL migrations (001_employee_core.sql, 002_attendance_core.sql)

- **apps/frontend**: Next.js frontend (TypeScript/React)
  - `app/` - App router structure
  - `app/(authenticated)/` - Protected routes
  - `components/` - Reusable UI components
  - `lib/` - Utility functions

## Code Conventions

### TypeScript
- Use strict mode (enforced in tsconfig.json)
- Type all function parameters and return values
- Use interfaces for object shapes

### Frontend (Next.js)
- Use TSX for React components
- Use Server Components by default, Client Components sparingly
- Use Tailwind CSS for styling
- Follow folder-based routing structure

### Backend (API)
- Use TypeScript strictly
- Follow RESTful conventions
- Handle errors gracefully with appropriate status codes

## Branch Naming

```
feature/<ticket-id>-short-description
bugfix/<ticket-id>-short-description
refactor/<ticket-id>-short-description
```

Example: `feature/TICKET-123-add-employee-dashboard`

## Commit Messages

Follow Conventional Commits:
```
type(scope): description

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`

Example:
```
feat(attendance): add attendance calendar widget

Implements attendance tracking UI with date picker and status visualization.

Closes TICKET-456
```

## Pull Request Guidelines

- Title: Use the same format as conventional commits
- Description: Should include:
  - What was changed
  - Why it was changed
  - Testing notes (if applicable)
- Link the ticket/issue in the description

## Before Creating PR

1. Run linting and tests if applicable
2. Verify code builds without errors
3. Test the changes locally
4. Ensure no console errors in browser/terminal
