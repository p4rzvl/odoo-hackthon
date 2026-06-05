# Instructions for AI Coding Agents

Welcome! Please review these guidelines before making edits or adding features to this codebase.

## 1. Technology Stack
- **Frontend**: Next.js (TypeScript, Tailwind CSS)
- **Backend**: Node.js + Express (TypeScript)
- **Database / ORM**: PostgreSQL via Neon hosting & Prisma ORM
- **Validation**: Zod (for both API request/response validation and React Hook Form validation)

## 2. Directory Layout Constraints
- **Backend**: Code goes inside `backend/src/`. Maintain separation of concerns:
  - `routes/` - Route definitions
  - `controllers/` - HTTP layer logic (calls services)
  - `services/` - Business logic (calls repositories)
  - `repositories/` - Direct database query layer using Prisma
  - `validations/` - Zod schemas for input validation
  - `middleware/` - Express middlewares (auth, error handler, etc.)
  - `lib/` - Shared libraries / helper instances (e.g., Prisma client)
  - `types/` - Shared TypeScript types
- **Frontend**: Code goes inside `frontend/`. Maintain clean folder layout:
  - `app/` - Next.js App Router pages
  - `components/` - Reusable UI widgets
  - `hooks/` - Custom react hooks
  - `lib/` - Client utilities
  - `services/` - API client/fetcher services
  - `validations/` - Zod schemas for form submissions

## 3. Styling & Component Constraints
- **NO Shadcn UI**: We are currently **not** using Shadcn UI. Implement custom styling using Tailwind CSS.
- **Odoo-Inspired Design System**:
  - Adopt design patterns inspired by Odoo (professional, ERP/business look).
  - Use key structures: Sidebar navigation, Topbar, Metric cards, and clean data tables with filters/sorting.
  - Colors: Standard Odoo-inspired neutrals, muted primary purple, and sleek layouts.
  - Animations: Add subtle micro-animations/hover-effects.
- **Universal Toast Alerts**:
  - We use `sonner` for toast alerts (Toaster is pre-mounted inside the root layout).
  - Import and trigger alerts globally:
    ```typescript
    import { toast } from 'sonner';
    toast.success('Successfully completed operation!');
    toast.error('An error occurred. Try again.');
    ```

## 4. Database Schema and Relations
- Document database designs in `docs/database.md` before coding.
- Keep `backend/prisma/schema.prisma` clean and standard.

## 5. Strict Validation
- Validate all form submissions on the frontend with Zod.
- Validate all incoming controller request payloads on the backend using Zod middleware before processing.
