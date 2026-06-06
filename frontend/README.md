This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# VendorBridge ERP — Frontend
## Getting Started
A Next.js 16 (App Router) web application for the **VendorBridge ERP** system — an Odoo-inspired procurement management platform built for the Odoo Hackathon. It provides role-based dashboards for Admins, Officers, Managers, and Vendors to manage the full procurement lifecycle.
First, run the development server:
---
## Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Getting Started](#getting-started)
- [Authentication & Roles](#authentication--roles)
- [Pages & Routes](#pages--routes)
  - [Public Pages](#public-pages)
  - [Dashboard Pages](#dashboard-pages)
- [Components](#components)
- [Services (API Layer)](#services-api-layer)
- [Context](#context)
- [Validations](#validations)
- [Design System](#design-system)
---
## Tech Stack
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.7 | React framework (App Router, SSR, routing) |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Static typing |
| **Tailwind CSS** | ^4 | Utility-first styling |
| **React Hook Form** | ^7 | Form state management |
| **Zod** | ^4 | Schema validation |
| **Sonner** | ^2 | Toast notifications |
| **Recharts** | ^3 | Data charts (reports) |
| **Lucide React** | ^1 | Icon library |
---
## Project Structure
```
frontend/
├── app/
│   ├── layout.tsx              # Root layout (AuthProvider, Toaster, fonts)
│   ├── page.tsx                # Home page (backend health check)
│   ├── globals.css             # Global styles
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── register/
│   │   └── page.tsx            # Registration page
│   ├── invoice-print/
│   │   └── [id]/page.tsx       # Print-ready invoice page
│   └── (dashboard)/            # Route group — protected dashboard
│       ├── layout.tsx          # Dashboard layout (auth guard, sidebar, topbar)
│       ├── dashboard/
│       │   └── page.tsx        # Role-specific dashboard home
│       ├── vendors/
│       │   └── page.tsx        # Vendor directory management
│       ├── rfqs/
│       │   ├── page.tsx        # RFQ list
│       │   ├── create/         # Create new RFQ
│       │   └── [id]/
│       │       ├── page.tsx    # RFQ detail view
│       │       ├── edit/       # Edit RFQ draft
│       │       └── compare/    # Quotation comparison
│       ├── quotations/
│       │   └── submit/         # Vendor quotation submission
│       ├── approvals/
│       │   └── page.tsx        # Approval queue (Manager)
│       ├── purchase-orders/
│       │   ├── page.tsx        # PO list
│       │   └── [id]/page.tsx   # PO detail
│       ├── invoices/
│       │   ├── page.tsx        # Invoice list
│       │   ├── create/         # Generate invoice from PO
│       │   └── [id]/page.tsx   # Invoice detail
│       ├── activity-logs/
│       │   └── page.tsx        # System audit logs
│       ├── notifications/
│       │   └── page.tsx        # Notification center
│       ├── reports/
│       │   └── page.tsx        # Procurement analytics
│       └── admin/
│           └── users/          # Admin user management
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Topbar.tsx              # Top header bar
│   ├── RoleGuard.tsx           # Role-based access wrapper
│   └── StatusBadge.tsx         # Status pill component
├── context/
│   └── AuthContext.tsx         # Auth state (user, login, logout)
├── services/                   # API call functions (typed)
│   ├── auth.ts
│   ├── vendor.ts
│   ├── rfq.ts
│   ├── quotation.ts
│   ├── approval.ts
│   ├── purchaseOrder.ts
│   ├── invoice.ts
│   ├── dashboard.ts
│   ├── activityLog.ts
│   ├── notification.ts
│   └── report.ts
├── validations/
│   └── auth.validation.ts      # Zod schemas for login/register
├── middleware.ts               # Route protection (deprecated — use proxy)
├── next.config.ts              # Next.js configuration
└── .env                        # Environment variables
```
---
## Environment Setup
Create a `.env` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```
> **Note:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never prefix secrets here.
---
## Getting Started
```bash
# Install dependencies
npm install
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
# Build for production
npm run build
# Start production server
npm start
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
The app runs on **http://localhost:3000** by default. If port 3000 is occupied, Next.js will try 3001.
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
> **Prerequisite:** The backend Express API must be running on port 5001. See `backend/README.md`.
This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
---
## Learn More
## Authentication & Roles
To learn more about Next.js, take a look at the following resources:
Authentication is **cookie-based** (HTTP-only JWT cookies managed by the Express backend). The frontend never stores tokens in `localStorage`.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
### Roles
You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
| Role | Description |
|---|---|
| `ADMIN` | Full system access — activates accounts, views audit logs |
| `MANAGER` | Approves quotations and purchase orders |
| `OFFICER` | Creates RFQs, manages vendors, generates POs and invoices |
| `VENDOR` | Submits quotations, views assigned RFQs, manages invoices |
## Deploy on Vercel
### Auth Flow
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
1. User logs in at `/login` → session cookie set by backend
2. `AuthContext` loads user from `GET /api/v1/auth/me` on mount
3. If session fails, it attempts a token refresh via `GET /api/v1/auth/refresh`
4. Dashboard layout (`(dashboard)/layout.tsx`) redirects unauthenticated users to `/login`
5. `RoleGuard` component enforces page-level role restrictions
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
---
## Pages & Routes
### Public Pages
#### `/` — Health Check Dashboard
**File:** `app/page.tsx`
A diagnostic page that pings the Express backend health endpoint and displays:
- Express API server status (Online/Offline)
- PostgreSQL database connectivity (Connected/Disconnected)
- Server uptime and response timestamp
- JSON response schema in a dark terminal-style console
No authentication required. Useful for verifying the full stack is running.
---
#### `/login` — Login
**File:** `app/login/page.tsx`
- Email + password login form using React Hook Form + Zod validation
- `useSearchParams` reads an `?email=` query param (pre-fills email after registration)
- Show/hide password toggle
- Redirects to `/dashboard` if already authenticated
- Wrapped in `<Suspense>` to fix Next.js hydration warning caused by `useSearchParams`
---
#### `/register` — Registration
**File:** `app/register/page.tsx`
Multi-field registration form:
- First Name, Last Name, Email, Phone, Country, Password, Additional Info
- Role selection: `OFFICER`, `VENDOR`, `MANAGER` (Admin accounts are seeded)
- Optional profile photo upload (Base64, max 2MB)
- On success, redirects to `/login?email=...` — note that accounts are **inactive** until an Admin activates them
---
#### `/invoice-print/[id]` — Printable Invoice
**File:** `app/invoice-print/[id]/page.tsx`
A print-optimized, CSS `@media print`-styled invoice page:
- Fetches invoice data from the backend using the invoice ID from the URL
- Auto-triggers `window.print()` on load after data is ready
- Displays: invoice number, dates, supplier/buyer info, line items table, GST breakdown (CGST 9% + SGST 9%), grand total
- No sidebar/topbar — standalone layout for clean printing/PDF export
---
### Dashboard Pages
All routes under `(dashboard)/` require authentication. The layout renders the **Sidebar** and **Topbar** around page content.
---
#### `/dashboard` — Role Dashboard
**File:** `app/(dashboard)/dashboard/page.tsx`
Renders a different dashboard view based on the authenticated user's role:
| Role | Dashboard Content |
|---|---|
| `ADMIN` | Pending accounts count, active users, audit log count, quick links |
| `OFFICER` | Active RFQs, registered vendors, pending approvals, total PO spend |
| `MANAGER` | Items pending sign-off, approved today count, monthly spend authorized |
| `VENDOR` | Invited RFQs, submitted bids, unpaid invoices total |
Metrics are fetched from `GET /api/v1/dashboard/metrics`. Shows skeleton loading state while fetching.
---
#### `/vendors` — Vendor Directory
**File:** `app/(dashboard)/vendors/page.tsx`
**Access:** `OFFICER`, `MANAGER`
- Lists all registered vendors in a searchable, filterable table
- Columns: Company Name, GST Number, Contact, Country, Status, Actions
- Inline status toggle: `PENDING → ACTIVE → BLOCKED`
- Onboard new vendor modal form (company name, GST, address, contact details)
- Status badge color-coded: Active (green), Pending (amber), Blocked (red)
---
#### `/rfqs` — RFQ List
**File:** `app/(dashboard)/rfqs/page.tsx`
**Access:** `OFFICER` (full CRUD), `VENDOR` (view invited RFQs only)
- Tabbed filter: `ALL | DRAFT | PUBLISHED | CLOSED` (Vendors don't see DRAFT tab)
- Table columns: RFQ Title, Category, Deadline, Supplier Invitations / My Bid Status, Status, Actions
- Officers can publish DRAFT RFQs directly from the list
- Paginated (10 per page)
---
#### `/rfqs/create` — Create RFQ
**Access:** `OFFICER`
Multi-step wizard to create a new RFQ:
1. **Step 1:** Title, description, category, deadline, file attachment upload
2. **Step 2:** Add line items (item name, quantity, unit)
3. **Step 3:** Select vendors to invite from the registered vendor list
- Can save as Draft or Publish immediately
---
#### `/rfqs/[id]` — RFQ Detail
**File:** `app/(dashboard)/rfqs/[id]/page.tsx`
**Access:** All roles (context-aware)
Displays full RFQ details:
- Title, category, description, deadline, status, attached file download
- Line items table with quantities
- Invited vendor list with their quotation statuses
- Officers see "Edit" and "Compare Quotations" actions
- Vendors see their own submitted quotation (or a "Submit Quotation" button)
- Shows deadline-passed warning badge
---
#### `/rfqs/[id]/edit` — Edit RFQ
**File:** `app/(dashboard)/rfqs/[id]/edit/page.tsx`
**Access:** `OFFICER` (only DRAFT RFQs)
Same multi-step form as create but pre-populated with existing data. Can update and optionally publish in one action.
---
#### `/rfqs/[id]/compare` — Quotation Comparison
**Access:** `OFFICER`, `MANAGER`
Side-by-side comparison table of all submitted vendor quotations for an RFQ. Highlights the lowest price per line item. Used to select the winning quotation to convert to a Purchase Order.
---
#### `/quotations/submit` — Submit Quotation
**Access:** `VENDOR`
Form for a vendor to submit pricing against an RFQ they've been invited to:
- Lists all line items from the RFQ
- Vendor enters unit price per item
- Calculated total shown
- Can save as Draft or Submit as Final
---
#### `/approvals` — Approval Queue
**File:** `app/(dashboard)/approvals/page.tsx`
**Access:** `MANAGER`
Two-tab view:
- **Pending:** Quotations waiting for Manager approval — shows vendor, RFQ, pricing, deadline. Approve/Reject with comments.
- **History:** Previously actioned approvals with timestamps and comments
Approving a quotation generates a Purchase Order automatically.
---
#### `/purchase-orders` — Purchase Orders List
**File:** `app/(dashboard)/purchase-orders/page.tsx`
**Access:** `OFFICER`, `MANAGER`
- Lists all Purchase Orders with status, vendor, PO number, total amount, created date
- Status filter tabs: ALL, PENDING, APPROVED, REJECTED
- Links to individual PO detail pages
---
#### `/purchase-orders/[id]` — PO Detail
**File:** `app/(dashboard)/purchase-orders/[id]/page.tsx`
**Access:** `OFFICER`, `MANAGER`, `VENDOR`
Displays:
- PO number, vendor info, linked RFQ, status
- Line items with pricing
- GST breakdown
- Manager can Approve/Reject from this page
- Officer/Vendor can generate an invoice (if APPROVED and no invoice yet)
---
#### `/invoices` — Invoice List
**File:** `app/(dashboard)/invoices/page.tsx`
**Access:** `OFFICER`, `MANAGER`, `VENDOR`
- Table of all invoices: Invoice #, PO #, Vendor, Invoice Date, Due Date, Amount, Status
- Status filter: ALL, PENDING, PAID, OVERDUE
- Links to invoice detail and print pages
---
#### `/invoices/create` — Generate Invoice
**File:** `app/(dashboard)/invoices/create/page.tsx`
**Access:** `OFFICER`, `ADMIN`
Accessed via `?poId=<id>` query parameter from a PO detail page:
- Shows PO summary, vendor info, and financial breakdown (subtotal + CGST 9% + SGST 9%)
- Date pickers for Invoice Date (defaults to today) and Due Date (defaults to today + 30 days)
- Wrapped in `<Suspense>` — dates initialized in `useEffect` to prevent hydration mismatch
---
#### `/invoices/[id]` — Invoice Detail
**File:** `app/(dashboard)/invoices/[id]/page.tsx`
**Access:** `OFFICER`, `MANAGER`, `VENDOR`
Full invoice view:
- Invoice number, dates, status badge
- Supplier and buyer information
- Line items with quantities and pricing
- GST breakdown and grand total
- Mark as Paid action (Officer/Manager)
- Open printable invoice in new tab
---
#### `/activity-logs` — Activity Logs
**File:** `app/(dashboard)/activity-logs/page.tsx`
**Access:** All authenticated roles
Chronological audit trail of all system actions:
- Grouped by date with relative timestamps
- Filterable by action type and user
- Sliding detail panel shows full log metadata on row click
- Paginated list
---
#### `/notifications` — Notification Center
**File:** `app/(dashboard)/notifications/page.tsx`
**Access:** All authenticated roles
Full notifications page:
- Lists all notifications with type badge (color-coded: RFQ Invitation, Approval Request, PO Generated, Invoice, etc.)
- Unread notifications highlighted with a purple left border
- Mark all as read button
- Paginated (15 per page)
---
#### `/reports` — Reports & Analytics
**File:** `app/(dashboard)/reports/page.tsx`
**Access:** `OFFICER`, `MANAGER`
Procurement analytics dashboard using **Recharts**:
- Total spend over time (line chart)
- Spend by category (bar chart)
- Vendor performance metrics
- PO approval rate summary cards
---
#### `/admin/users` — User Management
**Access:** `ADMIN` only
Admin control panel:
- Lists all registered users with role, status, and registration date
- Activate/Deactivate user accounts
- Change user roles
- View user profile details
---
## Components
### `Sidebar.tsx`
The left navigation sidebar. Dynamically renders nav items based on the authenticated user's role. Shows user name, email, active role indicator, and a Sign Out button.
**Role-filtered nav items:**
- Dashboard — all roles
- User Manager — ADMIN only
- Vendor Directory — OFFICER, MANAGER
- RFQs — OFFICER, VENDOR
- Quotations — VENDOR only
- Approvals — MANAGER only
- Purchase Orders — OFFICER, MANAGER
- Invoices — OFFICER, MANAGER, VENDOR
- Activity Logs — all roles
- Notifications — all roles
- Reports — OFFICER, MANAGER
---
### `Topbar.tsx`
Fixed top header bar containing:
- **Breadcrumbs** — dynamically generated from the current URL path
- **Search bar** — ERP record search input (UI only)
- **Notification bell** — shows unread count badge, opens a dropdown with the latest 5 unread notifications. Polls every 30 seconds.
- **Version badge** — displays current app version
---
### `RoleGuard.tsx`
A client component wrapper that enforces role-based access at the page level.
```tsx
<RoleGuard allowedRoles={['OFFICER', 'ADMIN']}>
  {/* Only renders if user has one of these roles */}
</RoleGuard>
```
Shows a loading spinner while auth state resolves. Redirects to `/dashboard` with a toast error if the user lacks permission.
---
### `StatusBadge.tsx`
A reusable pill badge for displaying entity statuses (RFQ, PO, Invoice, etc.) with appropriate color coding.
```tsx
<StatusBadge status="PUBLISHED" />
<StatusBadge status="APPROVED" />
<StatusBadge status="OVERDUE" />
```
---
## Services (API Layer)
All API calls are centralized in the `services/` directory. Each file exports typed async functions. The base URL is read from `NEXT_PUBLIC_API_URL`.
| File | Endpoints covered |
|---|---|
| `auth.ts` | login, register, logout, refresh, getCurrentUser |
| `vendor.ts` | list vendors, onboard vendor, update vendor status, get vendor detail |
| `rfq.ts` | list RFQs, create, get detail, update, publish, upload attachment |
| `quotation.ts` | submit quotation, get quotation detail, update draft |
| `approval.ts` | list approvals, approve, reject |
| `purchaseOrder.ts` | list POs, get detail, update status |
| `invoice.ts` | list invoices, create invoice, get detail, mark as paid |
| `dashboard.ts` | fetch role-specific metrics |
| `activityLog.ts` | fetch paginated activity logs |
| `notification.ts` | list notifications, get unread count, mark as read, mark all read |
| `report.ts` | fetch procurement analytics data |
All service functions return a typed response object with a `success: boolean` field and either `data` or `error`.
---
## Context
### `AuthContext.tsx`
Provides global authentication state via React Context.
**Exported values:**
```ts
{
  user: ExtendedUser | null,   // Authenticated user object (includes computed `name`)
  token: string | null,         // 'session-active' when logged in
  loading: boolean,             // True while session is being verified
  login(data): Promise<AuthResponse>,
  register(data): Promise<AuthResponse>,
  logout(): Promise<void>
}
```
**Session loading flow:**
1. On mount, calls `GET /api/v1/auth/me`
2. If it fails, attempts `POST /api/v1/auth/refresh` then retries `/me`
3. Sets `loading = false` when done
Use via the `useAuth()` hook in any client component.
---
## Validations
### `validations/auth.validation.ts`
Zod schemas for form validation:
- **`loginSchema`** — `email` (valid email), `password` (min 6 chars)
- **`registerSchema`** — `firstName`, `lastName`, `email`, `phone`, `country`, `password`, `role`, optional `additionalInfo`, optional `profilePhoto` (Base64)
---
## Design System
The UI follows an **Odoo-inspired** design language:
| Token | Value | Usage |
|---|---|---|
| Brand Primary | `#714B67` | Buttons, active states, links |
| Brand Light | `#9e7592` | Hover states |
| Brand Dark | `#5a3c52` | Active/pressed states |
| Text Primary | `#212529` | Main body text |
| Text Muted | `#6b7280` | Labels, secondary text |
| Border | `#e5e5e5` | Cards, dividers, inputs |
| Background | `#f8f9fa` | Page background, input fills |
| Danger | `#dc2626` | Errors, destructive actions |
| Success | `#16a34a` | Positive statuses |
**Typography:** Geist Sans + Geist Mono (Google Fonts via `next/font`)
**Component patterns:**
- Cards: `bg-white rounded-[8px] border border-[#e5e5e5] shadow-sm`
- Inputs: `bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px]` with `focus:border-[#714B67]`
- Primary buttons: `bg-[#714B67] hover:bg-[#9e7592]`
- All interactive elements have `transition-all` for smooth hover effects
---
## Known Issues & Notes
- The `middleware.ts` file uses the deprecated `middleware` convention. Next.js 16 recommends renaming it to `proxy.ts`. This is a warning, not a breaking issue.
- A workspace root warning appears during build due to multiple `package-lock.json` files. This can be silenced by setting `turbopack.root` in `next.config.ts`.
- Pages using `useSearchParams()` (`/login`, `/invoices/create`) are wrapped in `<Suspense>` boundaries to prevent React hydration mismatches, as required by Next.js App Router.
- Date state in `invoices/create` is initialized inside `useEffect` (not at render time) to prevent `Date.now()` hydration mismatches between server and client.
