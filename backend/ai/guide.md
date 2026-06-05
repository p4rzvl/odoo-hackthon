# AI Agent Developer Guide - Backend

This guide outlines the development standards and architectural rules for the backend service. Follow this precisely to score maximum evaluation points for database design, validation, security, and scalability.

## 1. Core Stack

- **Framework**: Node.js + Express with TypeScript.
- **Database**: PostgreSQL (via hosted Neon).
- **ORM**: Prisma.
- **Validation**: Zod.

## 2. Relational Database Design Rules (Highest Priority Evaluated)

- **Normalization**: Ensure tables are normalized to minimize redundancy.
- **Strict Relations**: Define foreign keys, cascade deletes/updates, and constraints at the database level.
- **Performance**: Create indexes on primary keys, foreign keys, and columns used in filtering/searching.
- **Data Types**: Choose specific types (e.g., Integer, DateTime, Boolean) rather than default VARCHAR.
- **Transactions**: Wrap multi-step mutations in Prisma transactions (`db.$transaction`) to maintain data integrity.
- **Migrations**: Always generate migrations via Prisma for any schema adjustments. Track migrations in Git.

## 3. Separation of Concerns & Folder Organization

Follow the directory architecture strictly:

- `src/routes/` - Express Router mappings using RESTful paths (e.g. `/api/v1/auth/login`).
- `src/controllers/` - Extract query/body params and invoke service layer functions.
- `src/services/` - Execute business logic, calculations, and orchestrations.
- `src/repositories/` - Read/write database queries using Prisma client.
- `src/validations/` - Maintain Zod validation schemas for all routes.
- `src/middleware/` - Custom validation injectors, authenticators, error handlers.

## 4. Input Validation & Security (Critical)

- **Sanitize and Validate**: Validate **ALL** user inputs on the backend using Zod schemas.
- **Validation Middleware**: Intercept requests with validation schemas before executing controller logic.
- **Data Injection Protection**: Rely entirely on Prisma's parameterized queries to avoid SQL Injection.
- **Sensitive Secrets**: Never log or return sensitive credentials (e.g. hashed passwords, private keys).

## 5. Environment Variables Configuration
- Copy the [backend/.env.example](file:///Users/dhairyadarji/Developer/odoo%20hackthon/backend/.env.example) template to create your local `backend/.env` file.
- Configure `DATABASE_URL` (Neon PostgreSQL link), `PORT` (default `5001`), `FRONTEND_URL` (CORS settings), and JWT auth secrets.
- Never commit the resolved `.env` file containing passwords/secrets.

## 6. Errors and Logs
- **Graceful Failure**: Never crash the backend process. Implement try-catch blocks in asynchronous controller/service functions.
- **Internal Masking**: Do not expose database traces, system stack traces, or query dumps to the client.
- **Consistent Responses**: Standardize error JSON payloads:
  ```json
  {
    "success": false,
    "error": "User-friendly error description",
    "field": "affected_field_if_any"
  }
  ```

## 7. Project Context & Requirements
- Note that all high-level business logic, PRD specifications, and task goals are located in the root `docs/` folder (e.g. `docs/context.md` or `docs/todo.md`).
- Consult root docs files to align with the core functional problem statement.
