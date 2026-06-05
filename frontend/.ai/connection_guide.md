# Frontend Connection & Styling Guide

This guide details how the Next.js frontend integrates with the backend API, performs validation, and styles components without external layout toolkits.

## 1. Connecting to Backend APIs
- All backend communication maps to the endpoint specified in `NEXT_PUBLIC_API_URL` (usually `http://localhost:5001/api`).
- Keep API calling services modular in the `frontend/services/` folder (e.g. `auth.ts`, `orders.ts`).
- Ensure all api requests handle loaders, exceptions, and toaster notifications (using `sonner`) gracefully.

## 2. Validation Constraints (Zod & React Hook Form)
- All client-side inputs must be strongly validated.
- Integrate Zod schemas with React Hook Form using the `@hookform/resolvers/zod` resolver.
- Place shared form rules under `frontend/validations/` folder.

## 3. Styling Guidelines (No Shadcn UI)
- Build custom UI components with pure Tailwind CSS.
- **Color Scheme**: Use Odoo purple (#714B67 or #71639e) as the brand indicator, slate/gray neutrals, and subtle gradients.
- **Layouts**: Implement persistent layouts using:
  - Sidebar: Main navigation links
  - Topbar: Profiles, current view breadcrumbs, quick global search
  - Cards: Key metrics dashboard widgets
  - Tables: Data views with zebra-striping, clear headings, search query fields, and sorting controls.
