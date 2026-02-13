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
