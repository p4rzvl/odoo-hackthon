# Backend Connection & Architecture Guide

This guide details how the Express backend integrates with the database, typescript compiler, and Next.js frontend.

## 1. Database Connectivity (Neon PostgreSQL + Prisma)
- The database is PostgreSQL hosted on Neon.
- Connection URL is configured in `backend/.env` under the key `DATABASE_URL`.
- Generate client queries using Prisma Client:
  ```bash
  npx prisma generate
  ```
- Apply schema modifications using migrations:
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```
- Retrieve database instance in code through a shared client (e.g. `src/lib/db.ts` or similar instance).

## 2. API Server Configurations
- **Port Binding**: Set to port `5001` (configured via `PORT` in `.env`).
- **CORS Handling**: Cross-Origin Resource Sharing is enabled for `FRONTEND_URL` (default: `http://localhost:3000`).
- **Body Parsing**: JSON request payloads are automatically parsed by `express.json()`.

## 3. Communication Pattern
- Future routes should map to `/api/v1/...`.
- Controllers call service layers, services invoke repository/database queries, and routes validate schemas using Zod.
- Any request body schema should have a corresponding Zod model defined in `src/validations/` and checked as a middleware interceptor before executing controller functions.
