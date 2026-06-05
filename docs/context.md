# Project Context

## Overview
This is a full-stack web application skeleton built for the Odoo hiring hackathon, featuring a TypeScript Node/Express backend API and a Next.js client-side frontend, configured to work with a PostgreSQL instance hosted on Neon using Prisma 7.

## Key Features & Completed Milestones
- **Architecture**: Modular decoupled Express (backend) + Next.js App Router (frontend).
- **Prisma 7 Integration**: Configured PostgreSQL pooling adapter with Neon cloud connection.
- **Robust Authentication**: Fully functional Register, Login, Logout, and Token Refresh APIs using JWT access tokens (30-minute expiry) and refresh tokens (7-day expiry).
- **Global Error Handler**: Custom Express error middleware returning standard JSON payloads preventing backend server crashes.
- **API Response Helpers**: Reusable utility triggers (`sendSuccess`/`sendError`) outputting consistent structures.
- **Database Seeding**: Prisma seed configuration pre-populating mock users:
  - Admin: `admin@example.com` (password: `admin123`)
  - Demo: `demo@example.com` (password: `demo123`)
- **Universal Toast Notifications**: Frontend-configured `sonner` framework for global feedback loops.
- **Zod Schema validation**: Strict request body validation on the server side and dynamic input form validation on the client side.
- **Odoo Inspired Layout**: Premium, styled landing check dashboard and protected view pages utilizing Odoo Purple (#714B67) branding highlights.

---

## Prisma Database Management & Commands

Here are the key commands to run, test, and sync your Prisma models:

### 1. Synchronizing Schema Changes (Fast Sync)
If you add or modify database tables in [backend/prisma/schema.prisma](file:///Users/dhairyadarji/Developer/odoo%20hackthon/backend/prisma/schema.prisma) and want to sync them directly to your Neon database during prototyping without tracking migrations:
```bash
cd backend
npx prisma db push
```

### 2. Creating Database Migrations (Production-Grade)
To generate database SQL migrations when you are ready to version control schema modifications:
```bash
cd backend
npx prisma migrate dev --name <migration_name>
```

### 3. Re-Generating Types Client
Always run this command after making schema adjustments so that TypeScript recognizes the updated models and fields in your code editor:
```bash
cd backend
npx prisma generate
```

### 4. Database UI (Studio)
To open a visual editor in your browser to inspect database tables, add rows manually, or run diagnostics:
```bash
cd backend
npx prisma studio
```
