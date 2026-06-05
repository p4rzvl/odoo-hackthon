# AI Agent Developer Guide - Frontend

This guide outlines UI/UX standards, performance criteria, and page layout architecture rules for the Next.js client-side application.

## 1. Core Stack
- **Framework**: Next.js App Router (TypeScript).
- **Styling**: Tailwind CSS (**Strictly NO Shadcn UI**).
- **Validation**: Zod + React Hook Form.
- **Icons**: Lucide React.
- **Toasts**: Sonner.

## 2. UI/UX Design System (Odoo-Inspired Style Language)
Reviewers evaluate frontend aesthetic quality daily. We style components to feel familiar, premium, and ERP-like:
- **Navigation Layouts**:
  - Persistent **Sidebar** on the left for main menus.
  - Global **Topbar** displaying view breadcrumbs, quick global search, and profile settings.
- **Visual Containers**:
  - High-visibility **Dashboard Cards** displaying key business metric summaries at a glance.
  - Interactive **Zebra-Striped Data Tables** with clear headers, query filtering fields, page navigation, and action buttons.
- **Typography & Layout**:
  - Clean sans-serif fonts, generous margins/padding to avoid visual clutter.
  - Hover micro-animations on interactive elements.

## 3. Dynamic Data Handlers (Highest Priority Evaluated)
- **No Hardcoded Content**: Display real data fetched dynamically from backend APIs using standard API services.
- **Interactive UI Feedback**: Handle and display data load transitions:
  - **Loading States**: Display skeleton panels, spinner indicators, or loaders during fetch delays.
  - **Error States**: Display helpful user-friendly messages when APIs fail; trigger toaster notifications via `sonner`.

## 4. Input & Form Validation
- Validate all user input fields on the client using Zod schema structures combined with React Hook Form.
- Display instant validation errors beneath input fields (e.g. "Please enter a valid email address").
- Never assume client validations are sufficient; coordinate closely with backend validations.

## 5. Performance and Optimization
- **Data Pagination**: Implement page-by-page fetching. Never query or render thousands of rows at once.
- **Lazy Loading**: Utilize Next.js route components and image caching configurations to preserve browser responsiveness.

## 6. Environment Variables Configuration
- Copy the [frontend/.env.example](file:///Users/dhairyadarji/Developer/odoo%20hackthon/frontend/.env.example) template to create your local `frontend/.env` file.
- Configure `NEXT_PUBLIC_API_URL` to point to your Express API server instance (e.g., `http://localhost:5001/api` for development).
- Any environment variables that need to be read in the browser client code MUST be prefixed with `NEXT_PUBLIC_`.
- Do NOT commit the final `.env` file to version control.

## 7. Project Context & Requirements
- All feature requests, mockups, design details, and functional problem specifications are stored in the root `docs/` folder (such as `docs/context.md` or `docs/design.md`).
- Consult root docs to align the frontend interfaces with the core business problem statement.

