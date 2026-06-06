# VendorBridge — Complete Implementation Plan

### Odoo Hackathon 2025 | Procurement & Vendor Management ERP

---

## 1. What Are We Building?

**VendorBridge** is a full-stack ERP covering the complete procurement lifecycle:

```
Officer creates RFQ → Vendors submit Quotations → Officer compares →
Approvals (L1 + L2) → Purchase Order auto-generated → Invoice generated →
PDF/Print/Email → Paid ✅
```

All actions are logged immutably. 4 user roles. 11 screens. ~13 database tables.

---

## 2. What's Already Done ✅

| Area                                             | Status  |
| ------------------------------------------------ | ------- |
| Express backend with TypeScript                  | ✅ Done |
| JWT Auth (access + refresh tokens)               | ✅ Done |
| Register / Login / Logout APIs                   | ✅ Done |
| Prisma 7 + Neon PostgreSQL connection            | ✅ Done |
| Global Error Handler middleware                  | ✅ Done |
| API Response Helpers (`sendSuccess`/`sendError`) | ✅ Done |
| Zod validation middleware                        | ✅ Done |
| Database seeding (admin + demo user)             | ✅ Done |
| Frontend Next.js App Router setup                | ✅ Done |
| Login + Register page (Odoo Purple theme)        | ✅ Done |
| Dashboard skeleton page                          | ✅ Done |
| Universal Sonner toast system                    | ✅ Done |
| `.env.example` files for both backend + frontend | ✅ Done |
| Role-based middleware skeleton                   | ✅ Done |

---

## 3. Build Phases

---

### 🟥 PHASE 1 — Database Schema (Foundation — Do First!)

**Priority: CRITICAL. Evaluators look here first.**

Expand `backend/prisma/schema.prisma` with all 13 tables from PRD.

> [!IMPORTANT]
> The User model must be expanded with `role`, `phone`, `country`, `firstName`, `lastName`, `profilePhoto` fields. The existing minimal schema only has `name`, `email`, `passwordHash`.

**Tables to add / modify:**

| Table             | Action                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `users`           | MODIFY — add `role (ENUM)`, `firstName`, `lastName`, `phone`, `country`, `profilePhoto`, `isActive` |
| `vendors`         | NEW — company_name, gst_number, category, contact_number, address, status ENUM, user_id FK          |
| `rfqs`            | NEW — title, category, description, deadline, status ENUM, created_by FK                            |
| `rfq_line_items`  | NEW — rfq_id FK, item_name, quantity, unit                                                          |
| `rfq_vendors`     | NEW — Junction: rfq_id + vendor_id, invited_at                                                      |
| `rfq_attachments` | NEW — rfq_id FK, file_name, file_path, uploaded_at                                                  |
| `quotations`      | NEW — rfq_id FK, vendor_id FK, gst_percent, subtotal, tax_amount, grand_total, status ENUM          |
| `quotation_items` | NEW — quotation_id FK, rfq_line_item_id FK, unit_price, total_price, delivery_days                  |
| `approvals`       | NEW — quotation_id FK, approver_id FK, level (L1/L2), status ENUM, remarks                          |
| `purchase_orders` | NEW — po_number UNIQUE auto-gen, quotation_id FK, vendor_id FK, total_amount, status ENUM           |
| `invoices`        | NEW — invoice_number UNIQUE, po_id FK, invoice_date, due_date, cgst, sgst, grand_total, status ENUM |
| `activity_logs`   | NEW — IMMUTABLE. actor_id FK, action_type ENUM, description, entity_id, entity_type                 |
| `notifications`   | NEW — user_id FK, message, type, is_read, related_entity_id                                         |

**After schema changes:**

```bash
cd backend && npx prisma generate && npx prisma db push
```

---

### 🟧 PHASE 2 — Backend: Core Modules (API Layer)

**Build each module in order — they depend on each other.**

---

#### 2A. Auth Module (Update existing)

Update `src/routes/auth.ts`, `src/controllers/auth.ts`, `src/services/auth.ts`:

- Add `role`, `firstName`, `lastName`, `phone`, `country` to register endpoint
- Update seed to create users with proper roles (admin, manager, officer, vendor)
- Role-based middleware: `requireRole(['admin', 'officer'])` pattern

#### 2B. Vendor Module [NEW]

Files: `routes/vendor.ts`, `controllers/vendor.ts`, `services/vendor.ts`, `repositories/vendor.ts`, `validations/vendor.ts`

Endpoints:

- `GET /api/v1/vendors` — list with search, category, status filters + pagination
- `POST /api/v1/vendors` — create vendor (admin/officer only)
- `GET /api/v1/vendors/:id` — single vendor detail
- `PUT /api/v1/vendors/:id` — update vendor info or status (admin only for block/unblock)

Business rules:

- Blocked vendors excluded from RFQ assignment queries
- Vendor status: active / pending / blocked

#### 2C. RFQ Module [NEW]

Files: `routes/rfq.ts`, `controllers/rfq.ts`, `services/rfq.ts`, `repositories/rfq.ts`, `validations/rfq.ts`

Endpoints:

- `GET /api/v1/rfqs` — list RFQs with filters (status, date) + pagination
- `POST /api/v1/rfqs` — create RFQ with line items + vendor assignments
- `GET /api/v1/rfqs/:id` — single RFQ detail with line items + vendors
- `PUT /api/v1/rfqs/:id` — update RFQ details/items
- `POST /api/v1/rfqs/:id/send` — publish RFQ, trigger vendor notifications

Business rules:

- Status machine: draft → published → closed
- File attachment upload (multer, local storage, max 5MB, PDF/JPG/PNG only)
- Blocked vendors cannot be assigned to RFQ
- Notifications created for each assigned vendor on publish

#### 2D. Quotation Module [NEW]

Files: `routes/quotation.ts`, `controllers/quotation.ts`, `services/quotation.ts`, `repositories/quotation.ts`, `validations/quotation.ts`

Endpoints:

- `POST /api/v1/quotations` — vendor submits quotation for RFQ
- `PUT /api/v1/quotations/:id` — vendor edits draft quotation (before deadline)
- `GET /api/v1/rfqs/:id/quotations` — all quotations for comparison view (officer)
- `POST /api/v1/quotations/:id/select` — officer selects vendor, triggers approval

Business rules:

- Auto-calculate subtotal, tax_amount, grand_total from line items
- Vendor cannot edit after submission (unless deadline not passed)
- Selecting vendor creates approval records + notifications

#### 2E. Approval Module [NEW]

Files: `routes/approval.ts`, `controllers/approval.ts`, `services/approval.ts`, `repositories/approval.ts`

Endpoints:

- `GET /api/v1/approvals` — list pending approvals for logged-in manager
- `GET /api/v1/approvals/:id` — single approval detail
- `POST /api/v1/approvals/:id/approve` — approve with optional remarks
- `POST /api/v1/approvals/:id/reject` — reject with required remarks

Business rules:

- L1 approval first, then L2
- Rejection at any level: notify officer, status reverts
- All approvals approved → PO auto-generated
- Activity log entry on every action

#### 2F. Purchase Order Module [NEW]

Files: `routes/purchaseOrder.ts`, `controllers/purchaseOrder.ts`, `services/purchaseOrder.ts`, `repositories/purchaseOrder.ts`

Endpoints:

- `GET /api/v1/purchase-orders` — list POs with status filter
- `GET /api/v1/purchase-orders/:id` — PO detail with vendor + items
- `POST /api/v1/purchase-orders` — generate PO from approved quotation

Business rules:

- Auto-generate PO number: `PO-YYYY-NNNN` (e.g., `PO-2025-0001`)
- Only created after all approvals pass
- Must use Prisma transaction (PO creation + activity log together)

#### 2G. Invoice Module [NEW]

Files: `routes/invoice.ts`, `controllers/invoice.ts`, `services/invoice.ts`, `repositories/invoice.ts`

Endpoints:

- `POST /api/v1/invoices` — generate invoice from PO
- `GET /api/v1/invoices/:id` — invoice detail
- `GET /api/v1/invoices/:id/pdf` — download PDF (use `pdfmake` or `puppeteer`)
- `POST /api/v1/invoices/:id/email` — email invoice via Nodemailer
- `PUT /api/v1/invoices/:id/mark-paid` — mark invoice paid

Business rules:

- CGST (9%) + SGST (9%) breakdown calculated
- Invoice number auto-generated (INV-YYYY-NNNN)
- Status: pending_payment → paid (or overdue if due date passes)

#### 2H. Dashboard Module [NEW]

Files: `routes/dashboard.ts`, `controllers/dashboard.ts`, `services/dashboard.ts`

Endpoints:

- `GET /api/v1/dashboard/summary` — aggregate stats: active RFQs, pending approvals, POs this month, overdue invoices
- `GET /api/v1/dashboard/recent-pos` — recent purchase orders (last 10)

#### 2I. Activity Logs Module [NEW]

Files: `routes/activityLog.ts`, `controllers/activityLog.ts`

Endpoints:

- `GET /api/v1/activity-logs` — filter by type, date range, pagination

Rules:

- NO update/delete routes. Write-only in code.
- Reusable `logActivity(actor, type, description, entityId, entityType)` helper function

#### 2J. Reports Module [NEW]

Files: `routes/reports.ts`, `controllers/reports.ts`, `services/reports.ts`

Endpoints:

- `GET /api/v1/reports/summary` — KPI cards: total spend, active vendors, PO fulfilment %, overdue invoices
- `GET /api/v1/reports/trends` — monthly procurement data (last 6 months)
- `GET /api/v1/reports/export` — export as CSV

#### 2K. Notifications Module [NEW]

Files: `routes/notifications.ts`, `controllers/notifications.ts`

Endpoints:

- `GET /api/v1/notifications` — unread notifications for logged-in user
- `PUT /api/v1/notifications/:id/read` — mark notification as read
- `PUT /api/v1/notifications/read-all` — mark all as read

---

### 🟨 PHASE 3 — Frontend: Layout & Shared Components

**Build shell before pages.**

#### 3A. App Layout (dashboard wrapper)

`frontend/app/(dashboard)/layout.tsx`:

- Persistent sidebar with all 9 module links
- Top navigation bar with breadcrumbs, search, notifications bell, profile dropdown
- Odoo Purple (`#714B67`) sidebar, white content area
- Protected — redirects to `/login` if no auth token

#### 3B. Shared Components

Create `frontend/components/` folder:

- `Sidebar.tsx` — navigation links, active state highlighting
- `Topbar.tsx` — breadcrumbs, notification bell, user avatar dropdown
- `DataTable.tsx` — reusable sortable/paginated table component
- `StatusBadge.tsx` — colored status pill (Active/Pending/Blocked/Draft/Approved/etc)
- `LoadingSkeleton.tsx` — skeleton cards + rows for loading states
- `ConfirmDialog.tsx` — generic confirmation modal
- `PageHeader.tsx` — page title + action buttons row
- `EmptyState.tsx` — empty state with icon + message

---

### 🟩 PHASE 4 — Frontend: All 11 Screens

Build in this order (dependencies first):

#### Screen 1+2: Auth pages (already exist — may need minor updates for role field)

- `app/login/page.tsx` — update role dropdown to show all 4 roles
- `app/register/page.tsx` — add firstName, lastName, phone, country fields

#### Screen 3: Dashboard

`app/(dashboard)/dashboard/page.tsx`:

- 4 analytics KPI cards (live data from `/api/v1/dashboard/summary`)
- Spending trends bar chart (use `recharts` library)
- Recent POs table
- Quick action buttons: + New RFQ, Add Vendor, View Invoices

#### Screen 4: Vendor Management

`app/(dashboard)/vendors/page.tsx`:

- Filter tabs: All | Active | Pending | Blocked (with counts)
- Search bar
- Vendor table with View action
- Add Vendor modal/form
- `app/(dashboard)/vendors/[id]/page.tsx` — vendor detail view

#### Screen 5: RFQ Creation

`app/(dashboard)/rfqs/page.tsx` — list of RFQs
`app/(dashboard)/rfqs/create/page.tsx` — multi-step creation form:

- Step 1: Basic details (title, category, deadline, description)
- Step 2: Line items (dynamic add/remove)
- Step 3: Vendor assignment + attachments
  `app/(dashboard)/rfqs/[id]/page.tsx` — RFQ detail view

#### Screen 6: Vendor Quotation Submission

`app/(dashboard)/quotations/submit/[rfqId]/page.tsx`:

- RFQ summary header
- Quotation items table (pre-fills qty from RFQ)
- GST, subtotal, grand total auto-calc
- Notes + payment terms
- Submit / Save Draft buttons
  `app/(dashboard)/quotations/page.tsx` — vendor's submitted quotations list

#### Screen 7: Quotation Comparison

`app/(dashboard)/rfqs/[id]/compare/page.tsx`:

- Side-by-side comparison table
- Lowest price cell highlighted in green
- Select vendor button → triggers approval

#### Screen 8: Approval Workflow

`app/(dashboard)/approvals/page.tsx` — list of pending approvals
`app/(dashboard)/approvals/[id]/page.tsx`:

- Visual stepper (Submitted → L1 Review → L2 Approval → Generate PO)
- Approve / Reject buttons
- Remarks textarea (required for reject)
- Quotation summary panel

#### Screen 9: Purchase Orders & Invoices

`app/(dashboard)/purchase-orders/page.tsx` — PO list
`app/(dashboard)/purchase-orders/[id]/page.tsx`:

- PO detail with bill-to/vendor info
- Generate Invoice button
  `app/(dashboard)/invoices/[id]/page.tsx`:
- GST invoice layout (CGST/SGST breakdown)
- Download PDF / Print / Email Invoice buttons
- Mark as Paid button + status badge

#### Screen 10: Activity & Audit Logs

`app/(dashboard)/activity-logs/page.tsx`:

- Filter tabs: All | RFQ | Approvals | Invoices | Vendors
- Timeline view (newest first)
- Date range filter

#### Screen 11: Reports & Analytics

`app/(dashboard)/reports/page.tsx`:

- KPI summary cards
- Monthly trends chart (`recharts`)
- Vendor performance table
- Export button (CSV download)

---

### 🔵 PHASE 5 — PDF, Email & File Upload

#### PDF Invoice Generation

- Backend: Use `pdfmake` (server-side) or `puppeteer` (HTML-to-PDF)
- Route: `GET /api/v1/invoices/:id/pdf`
- Invoice PDF must include: bill-to, vendor, line items, CGST/SGST, grand total, PO number, dates

#### Email Invoice

- Backend: Nodemailer with SMTP (add `EMAIL_USER`, `EMAIL_PASS` to `.env.example`)
- Template: HTML invoice email with PDF attachment

#### File Upload (RFQ Attachments)

- Backend: `multer` middleware for `POST /api/v1/rfqs` with file field
- Storage: local `/backend/uploads/` directory (outside web root)
- Validation: PDF/JPG/PNG only, max 5MB per file

---

### 🟣 PHASE 6 — Notifications System

- On RFQ published → create notification for each assigned vendor
- On vendor selects → create notification for L1 approver
- On L1 approves → create notification for L2 approver
- On approval complete → create notification for officer (PO ready)
- On rejection → create notification for officer with rejection reason
- Frontend: notification bell in topbar showing unread count badge

---

### ⚫ PHASE 7 — Seed Data Update & Testing

Update `backend/prisma/seed.ts` with comprehensive demo data:

- 1 Admin user (`admin@example.com`)
- 1 Manager/Approver (`manager@example.com`)
- 2 Officers (`officer@example.com`, `officer2@example.com`)
- 3 Vendors (vendor1, vendor2, vendor3 with different categories)
- 3 Sample vendors in vendor table (Active, Pending, Blocked)
- 2 RFQs (1 published with quotations, 1 draft)
- 3 Quotations for comparison
- 1 Approval chain in progress
- 1 Completed PO + Invoice (for dashboard stats)
- 10+ activity log entries

---

### 🔴 PHASE 8 — Final Polish & Pre-Submission

- [ ] All 11 screens functional with real DB data
- [ ] Loading + error states on every data-fetching page
- [ ] All forms have Zod validation with inline errors
- [ ] API pagination on all list endpoints
- [ ] PDF download functional
- [ ] Email sending tested (can use Mailtrap for testing)
- [ ] Activity logs written for every action
- [ ] README.md complete with setup instructions
- [ ] `.env.example` has all new variables (EMAIL_USER, EMAIL_PASS, etc.)
- [ ] No hardcoded mock data in final build
- [ ] Prisma migrations generated (not just db push)
- [ ] Security: role checks on every protected route
- [ ] Run final `npx prisma db push` + `npx prisma db seed`

---

## 4. File Structure After Build

```
backend/src/
├── controllers/
│   ├── auth.ts (exists)
│   ├── vendor.ts [NEW]
│   ├── rfq.ts [NEW]
│   ├── quotation.ts [NEW]
│   ├── approval.ts [NEW]
│   ├── purchaseOrder.ts [NEW]
│   ├── invoice.ts [NEW]
│   ├── dashboard.ts [NEW]
│   ├── activityLog.ts [NEW]
│   ├── reports.ts [NEW]
│   └── notification.ts [NEW]
├── services/
│   ├── auth.ts (exists)
│   ├── vendor.ts [NEW]
│   ├── rfq.ts [NEW]
│   ├── quotation.ts [NEW]
│   ├── approval.ts [NEW]
│   ├── purchaseOrder.ts [NEW]
│   ├── invoice.ts [NEW]
│   ├── dashboard.ts [NEW]
│   ├── reports.ts [NEW]
│   └── activityLog.ts [NEW]  ← shared helper
├── repositories/
│   ├── auth.ts (exists)
│   ├── vendor.ts [NEW]
│   ├── rfq.ts [NEW]
│   ├── quotation.ts [NEW]
│   ├── approval.ts [NEW]
│   ├── purchaseOrder.ts [NEW]
│   └── invoice.ts [NEW]
├── routes/
│   ├── auth.ts (exists)
│   ├── vendor.ts [NEW]
│   ├── rfq.ts [NEW]
│   ├── quotation.ts [NEW]
│   ├── approval.ts [NEW]
│   ├── purchaseOrder.ts [NEW]
│   ├── invoice.ts [NEW]
│   ├── dashboard.ts [NEW]
│   ├── activityLog.ts [NEW]
│   ├── reports.ts [NEW]
│   └── notification.ts [NEW]
├── validations/
│   ├── auth.ts (exists)
│   ├── vendor.ts [NEW]
│   ├── rfq.ts [NEW]
│   └── quotation.ts [NEW]
├── middleware/
│   ├── auth.ts (exists)
│   ├── errorHandler.ts (exists)
│   └── roleGuard.ts [NEW]
└── lib/
    ├── prisma.ts (exists)
    ├── response.ts (exists)
    └── activityLogger.ts [NEW]  ← shared log helper

frontend/app/
├── login/page.tsx (exists)
├── register/page.tsx (exists)
├── (dashboard)/           [NEW layout group]
│   ├── layout.tsx          ← sidebar + topbar wrapper
│   ├── dashboard/page.tsx
│   ├── vendors/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── rfqs/
│   │   ├── page.tsx
│   │   ├── create/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── compare/page.tsx
│   ├── quotations/
│   │   ├── page.tsx
│   │   └── submit/[rfqId]/page.tsx
│   ├── approvals/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── purchase-orders/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── invoices/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── activity-logs/page.tsx
│   └── reports/page.tsx
└── components/
    ├── Sidebar.tsx
    ├── Topbar.tsx
    ├── DataTable.tsx
    ├── StatusBadge.tsx
    ├── LoadingSkeleton.tsx
    ├── ConfirmDialog.tsx
    └── PageHeader.tsx
```

---

## 5. New Environment Variables Needed

Add to both `.env.example` files:

**Backend additions:**

```env
# Email (Nodemailer)
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USER="your-mailtrap-user"
EMAIL_PASS="your-mailtrap-password"
EMAIL_FROM="noreply@vendorbridge.com"

# File Storage
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=5

# Organization Info (for Invoice Bill-To)
ORG_NAME="Your Organization Name"
ORG_ADDRESS="123 Business Park, Ahmedabad"
ORG_GSTIN="25383438AFB"
```

---

## 6. Build Order Summary (Recommended Sequence)

```
Phase 1: DB Schema → prisma db push → prisma generate
Phase 2A: Auth update (roles, new fields)
Phase 2B: Vendor APIs
Phase 2C: RFQ APIs
Phase 2D: Quotation APIs
Phase 2E: Approval APIs
Phase 2F: PO APIs
Phase 2G: Invoice APIs
Phase 2H-K: Dashboard, Logs, Reports, Notifications APIs
Phase 3: Frontend layout (sidebar + topbar + shared components)
Phase 4: All 11 screens (in order listed above)
Phase 5: PDF + Email + File Upload
Phase 6: Notifications wiring
Phase 7: Rich seed data
Phase 8: Polish, testing, final review
```

---

## 7. Open Questions

> [!IMPORTANT]
> **Multi-level approvals**: Who are the L1 and L2 approvers? Are they hardcoded as all `manager` role users, or should the officer select approvers when creating the RFQ/initiating approval?  
> **Recommendation**: Auto-assign all `manager` role users as L1, and re-assign for L2 (or make L1 = first manager in DB, L2 = second). This keeps it simple.

> [!IMPORTANT]
> **Email setup**: Do you have SMTP credentials (Mailtrap/Gmail/SendGrid) ready? Email sending needs credentials added to `.env`.  
> **Recommendation**: Use Mailtrap for demo (free testing SMTP). Can hardcode a test email to simplify.

> [!NOTE]
> **File uploads**: Attachments stored locally (`/backend/uploads/`). In production this would be S3, but for hackathon local disk is fine.

---

## 8. Evaluation Priority

Based on what Odoo judges care about most:

| Priority    | Area              | Our Approach                                         |
| ----------- | ----------------- | ---------------------------------------------------- |
| 🔴 CRITICAL | Database Design   | 13 normalized tables, FKs, indexes, immutable logs   |
| 🔴 CRITICAL | Role-based Auth   | JWT + roleGuard middleware on every route            |
| 🟠 HIGH     | Code Architecture | routes → controllers → services → repositories       |
| 🟠 HIGH     | Input Validation  | Zod on all inputs, user-friendly errors              |
| 🟡 MEDIUM   | Frontend UI       | Odoo Purple theme, no hardcoded data, loading states |
| 🟡 MEDIUM   | PDF + Email       | pdfmake invoice, Nodemailer email                    |
| 🟢 NICE     | Testing           | Unit tests for tax calc + PO number generation       |
| 🟢 NICE     | Reports/Analytics | Live DB aggregation queries                          |
