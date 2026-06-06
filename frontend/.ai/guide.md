# AI Agent Developer Guide — Frontend

This guide outlines UI/UX standards, performance rules, and screen architecture for the VendorBridge Next.js frontend.

---

## 1. Core Stack

- **Framework**: Next.js App Router (TypeScript)
- **Styling**: Tailwind CSS (**Strictly NO Shadcn UI** — build all components custom)
- **Validation**: Zod + React Hook Form
- **Icons**: Lucide React
- **Toasts**: Sonner (already configured — use `toast.success()`, `toast.error()`, `toast.loading()`)
- **Charts**: Recharts (for dashboard + reports)
- **HTTP**: Axios or native fetch via service layer

---

## 2. Design System — Odoo Purple Theme

| Token | Value | Where Used |
|-------|-------|-----------|
| Primary | `#714B67` | Sidebar bg, primary buttons, active nav |
| Primary Dark | `#5a3d54` | Hover states |
| Primary Light | `#8b6080` | Subtle accents |
| Surface | `#f8f5f7` | Page/card backgrounds |
| Text | `#2d2d2d` | Main text |
| Muted | `#6b7280` | Secondary text |
| Success | `#16a34a` | Active badges, lowest-price highlight |
| Warning | `#d97706` | Pending badges |
| Danger | `#dc2626` | Blocked badges, errors |

**Font**: Inter (Google Fonts — already in layout.tsx)

**DO NOT** use glassmorphism, crazy animations, or 3D effects. Think Odoo/Stripe dashboard aesthetic.

---

## 3. App Layout (Protected Routes)

All authenticated pages live inside `app/(dashboard)/` route group with a shared layout:
- **Sidebar** (left, fixed): Odoo Purple background, white icons/text, 9 module links
- **Topbar** (top): breadcrumbs, notification bell (unread count badge), user profile dropdown
- Protected: redirects to `/login` if no valid auth token

**Sidebar navigation links:**
1. Dashboard (`/dashboard`)
2. Vendors (`/vendors`)
3. RFQs (`/rfqs`)
4. Quotations (`/quotations`)
5. Approvals (`/approvals`)
6. Purchase Orders (`/purchase-orders`)
7. Invoices (`/invoices`)
8. Activity Logs (`/activity-logs`)
9. Reports (`/reports`)

---

## 4. Shared Components (build these first)

Create `frontend/components/`:

| Component | Purpose |
|-----------|---------|
| `Sidebar.tsx` | Navigation with active state |
| `Topbar.tsx` | Breadcrumbs + notifications bell + user avatar |
| `DataTable.tsx` | Reusable sortable/paginated table |
| `StatusBadge.tsx` | Colored status pill (Active/Pending/Blocked/etc) |
| `LoadingSkeleton.tsx` | Skeleton for cards and table rows |
| `ConfirmDialog.tsx` | Generic confirm/cancel modal |
| `PageHeader.tsx` | Page title + action buttons row |
| `EmptyState.tsx` | Empty state with icon + message |

---

## 5. All 11 Screens

### Auth Screens (existing, may need updates)
- `app/login/page.tsx` — Email/password login
- `app/register/page.tsx` — Add firstName, lastName, phone, country, role dropdown (all 4 roles)

### Dashboard (`app/(dashboard)/dashboard/page.tsx`)
- 4 KPI cards: Active RFQs | Pending Approvals | POs This Month | Overdue Invoices
- Spending trends chart (Recharts bar/line)
- Recent POs table
- Quick actions: + New RFQ | Add Vendor | View Invoices

### Vendor Management
- `app/(dashboard)/vendors/page.tsx` — table with filter tabs (All/Active/Pending/Blocked), search, Add button
- `app/(dashboard)/vendors/[id]/page.tsx` — vendor detail view

### RFQ
- `app/(dashboard)/rfqs/page.tsx` — list with status filters
- `app/(dashboard)/rfqs/create/page.tsx` — multi-step form:
  - Step 1: Title, Category, Deadline, Description
  - Step 2: Line Items (dynamic add/remove rows)
  - Step 3: Vendor Assignment + file attachments
- `app/(dashboard)/rfqs/[id]/page.tsx` — RFQ detail
- `app/(dashboard)/rfqs/[id]/compare/page.tsx` — side-by-side quotation comparison

### Quotations
- `app/(dashboard)/quotations/page.tsx` — vendor's submitted quotations list
- `app/(dashboard)/quotations/submit/[rfqId]/page.tsx` — quotation submission form (for vendors)

### Approval Workflow (`app/(dashboard)/approvals/`)
- `app/(dashboard)/approvals/page.tsx` — pending approvals list (for manager role only)
- `app/(dashboard)/approvals/[id]/page.tsx`:
  - Visual stepper: Submitted → L1 Review → L2 Approval → Generate PO
  - **L1 and L2 approvers are auto-assigned** (first 2 managers by DB ID — do NOT show approver picker to officer)
  - Show L1 approver name + status, L2 approver name + status ("Awaiting" if not yet active)
  - Approve / Reject buttons visible only to the currently active approver
  - Reject requires remarks textarea (mandatory)
  - Quotation summary panel on right side

### Purchase Orders
- `app/(dashboard)/purchase-orders/page.tsx` — PO list
- `app/(dashboard)/purchase-orders/[id]/page.tsx` — PO detail + Generate Invoice button

### Invoices
- `app/(dashboard)/invoices/page.tsx` — invoice list
- `app/(dashboard)/invoices/[id]/page.tsx` — GST invoice layout + Download PDF/Print/Email/Mark Paid

### Activity Logs
- `app/(dashboard)/activity-logs/page.tsx` — timeline view with filter tabs

### Reports
- `app/(dashboard)/reports/page.tsx` — KPI cards + monthly chart + vendor performance table + Export CSV

---

## 6. Dynamic Data Rules (Critical for Evaluation)

- **NO hardcoded data** in final submission — all data from backend APIs
- Every list page must show:
  - **Loading state**: skeleton cards/rows while fetching
  - **Empty state**: custom empty message when no data
  - **Error state**: toast notification + error message when API fails
- Use the `services/` folder to centralize all API calls:
  ```typescript
  // services/vendor.service.ts
  export const getVendors = async (params) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors?${params}`);
    return res.json();
  };
  ```

---

## 7. Toast Notifications (Universal)

Sonner is already configured. Import and use:
```typescript
import { toast } from 'sonner';

toast.success('Vendor added successfully');
toast.error('Failed to create RFQ. Please try again.');
toast.loading('Generating PDF...');
toast.promise(apiCall(), { loading: '...', success: 'Done!', error: 'Failed' });
```

**Rule**: Show a toast after every user action (create, update, delete, approve, reject).

---

## 8. Form Validation (All Forms)

Use React Hook Form + Zod:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  gstNumber: z.string().length(15, 'GST number must be 15 characters'),
});

const form = useForm({ resolver: zodResolver(schema) });
```
Display inline errors beneath each input field.

---

## 9. Role-Based UI

Show/hide UI elements based on logged-in user role stored in auth context:
```typescript
const { user } = useAuth();

// Only show if manager/admin
{(user.role === 'manager' || user.role === 'admin') && (
  <ApproveButton />
)}
```

Never rely on frontend role checks for security — that's enforced by backend middleware.

---

## 10. Performance

- Pagination: all list views use `?page=1&limit=20` — never fetch all records
- Lazy-load heavy components (charts, PDF preview)
- Use `useCallback` and `useMemo` for expensive computations

---

## 11. Environment Variables

Copy `frontend/.env.example` → `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

- All browser-accessible vars MUST start with `NEXT_PUBLIC_`
- Server-side-only vars can use any name
- Never commit `.env` to Git

---

## 12. Services Folder Pattern

Centralize API calls in `frontend/services/`:
```
services/
├── auth.service.ts
├── vendor.service.ts
├── rfq.service.ts
├── quotation.service.ts
├── approval.service.ts
├── purchaseOrder.service.ts
├── invoice.service.ts
├── dashboard.service.ts
├── activityLog.service.ts
└── reports.service.ts
```

---

## 13. Project Context & Docs

- Full project context and workflow: [`docs/context.md`](../../docs/context.md)
- PRD with all screen specs: [`docs/PRD.md`](../../docs/PRD.md)
- UI mockup SVG: [`docs/VendorBridge - 8 hours.svg`](../../docs/VendorBridge%20-%208%20hours.svg)
- Backend API endpoints: [`docs/api.docs.md`](../../docs/api.docs.md)
