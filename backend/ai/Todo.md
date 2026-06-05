# Backend AI Todo

## Database & Models

- [ ] Define database models inside `prisma/schema.prisma` (e.g. User, Product, Order, Supplier).
- [ ] Generate database migrations: `npx prisma migrate dev --name init_models`.
- [ ] Write seed scripts to populate database tables with mock data for demo.

## Input Validation & Security

- [ ] Create authentication middleware (JWT check, user role permissions authorization).
- [ ] Set up Zod schema validators under `src/validations/` for each resource POST/PUT body.
- [ ] Create schema interceptor middleware to validate requests before controller execution.

## Core API Routes

- [ ] Implement user authentication endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`).
- [ ] Implement transactional models and service layers handling relational business logic.
- [ ] Clean up logs to ensure no sensitive credentials or raw database traces are exposed to clients.
