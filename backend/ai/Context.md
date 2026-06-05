# Backend AI Context

## Overview
This is a TypeScript-configured Express backend server designed for the Odoo hiring hackathon.

## Stack Details
- **Language**: TypeScript (running via `ts-node` in development, compiling via `tsc` for production).
- **Server Framework**: Express.js.
- **ORM**: Prisma 7 (using pluggable PostgreSQL database pool driver adapters).
- **Validation**: Zod (for validating router inputs before controller execution).

## Folder Layout
- `src/routes/` - RESTful router endpoints.
- `src/controllers/` - Controller route handlers.
- `src/services/` - Business logic routines.
- `src/repositories/` - Data query interface using Prisma Client.
- `src/validations/` - Schemas checking requests.
- `src/lib/` - Shared services (e.g. `prisma.ts`).

## Database Config
- Uses Neon PostgreSQL instance mapped via `DATABASE_URL` in `.env` and `prisma.config.ts`.
- Loaded via `@prisma/adapter-pg` driver pool adapter in `src/lib/prisma.ts` for Prisma 7 compatibility.

## How to use the Database Connection in Other Modules
1. **Importing the Client**:
   Always import the unified Prisma Client wrapper:
   ```typescript
   import prisma from '../lib/prisma';
   ```
2. **Executing Queries**:
   - Write standard Prisma queries inside your service/repository files:
     ```typescript
     const users = await prisma.user.findMany();
     ```
   - For raw queries:
     ```typescript
     const result = await prisma.$queryRaw`SELECT 1`;
     ```

## How to Manage Prisma Schema & Database Sync
1. **Adding Models**:
   - Edit the [backend/prisma/schema.prisma](file:///Users/dhairyadarji/Developer/odoo%20hackthon/backend/prisma/schema.prisma) file.
   - Note: In **Prisma 7**, the database connection URL is **NOT** declared inside `schema.prisma`. It is managed in `prisma.config.ts`.
2. **Applying Database Changes**:
   - To generate local type clients after schema changes:
     ```bash
     npx prisma generate
     ```
   - To sync schema changes directly to the live Neon database (prototyping):
     ```bash
     npx prisma db push
     ```
   - To generate schema migrations and apply them:
     ```bash
     npx prisma migrate dev --name <migration_name>
     ```

## Current Endpoints
- `GET /api/health` - Health check status displaying server parameters and PostgreSQL database connection connectivity state.
