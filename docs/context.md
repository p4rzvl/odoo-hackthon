# Project Context — VendorBridge ERP
### Odoo Hackathon 2025 | Procurement & Vendor Management

---

## Overview
VendorBridge is a full-stack Procurement & Vendor Management ERP built for the Odoo Hiring Hackathon 2025. It digitizes the complete procurement lifecycle: RFQ → Vendor Quotations → Comparison → Multi-Level Approvals → Purchase Orders → GST Invoices → PDF/Email delivery.

**Stack**: TypeScript Express backend + Next.js App Router frontend + Neon PostgreSQL via Prisma 7.

---

## Full Workflow
```
1. Officer creates RFQ → assigns vendors → saves & sends
2. Assigned vendors receive notification → submit quotations
3. Officer opens Quotation Comparison screen → selects best vendor
4. Approval workflow triggered → L1 Manager notified
5. L1 approves (with remarks) → L2 notified (sees L1 remarks) → L2 approves (with own remarks)
6. PO auto-generated (PO-YYYY-NNNN format) with status APPROVED
7. Officer views PO → clicks "Generate Invoice"
8. Invoice generated from PO with CGST(9%)/SGST(9%) breakdown
9. Invoice downloaded as PDF / printed / emailed to vendor
10. Officer marks invoice as paid
11. ALL steps logged immutably in activity_logs
```

---

## User Roles & Permissions

| Role | Key Capabilities |
|------|-----------------|
| **Admin** | Manage users (activate/deactivate), vendors, view all analytics — **created only via seed script** |
| **Manager** | Approve/reject in approval workflow (L1 or L2), view reports |
| **Officer** | Create RFQs, compare quotations, generate POs & Invoices |
| **Vendor** | Submit quotations, view assigned RFQs, view own POs |

Role is JWT-encoded. Every API route enforced with `requireRole([ ])` middleware.

### Auth Policy (Critical Rules)

1. **ADMIN role CANNOT be self-registered** — if `role: ADMIN` is sent to `/register`, Zod returns `403 Forbidden`. Admin accounts only via `npx prisma db seed`.
2. **New registrations default to `isActive = false` (PENDING)** — no tokens issued on register.
3. **Login with `isActive = false`** returns `403` with message: *"Your account is pending activation by an Admin."*
4. **Admin activates users** via `PATCH /api/v1/admin/users/:id/activate` → sets `isActive = true`.
5. **Onboarding flow**: Register → PENDING → Admin activates → Login → Tokens issued → Access.

### Demo Accounts (seeded, all isActive=true)
| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | ADMIN |
| manager1@example.com | manager123 | MANAGER (L1) |
| manager2@example.com | manager456 | MANAGER (L2) |
| officer@example.com | officer123 | OFFICER |
| vendor1@example.com | vendor123 | VENDOR |
| vendor2@example.com | vendor456 | VENDOR |
| vendor3@example.com | vendor789 | VENDOR |

---

## What's Already Done ✅

### Backend Modules

| Module | Files | Status |
|--------|-------|--------|
| Auth (JWT, Register, Login, Refresh, Logout) | `routes/`, `controllers/`, `services/`, `validations/` | ✅ |
| Vendors (CRUD, status, search) | `routes/`, `controllers/`, `services/`, `repositories/`, `validations/` | ✅ |
| RFQs (create, edit, publish, file upload, send) | `routes/`, `controllers/`, `services/`, `repositories/`, `validations/` | ✅ |
| Quotations (submit, draft, edit, select winner) | `routes/`, `controllers/`, `services/`, `repositories/`, `validations/` | ✅ |
| Approvals (L1/L2 list, approve/reject with remarks, PO auto-gen) | `routes/`, `controllers/`, `services/`, `repositories/`, `validations/` | ✅ |
| Purchase Orders (list with pagination, detail, status update) | `routes/`, `controllers/`, `services/`, `repositories/`, `validations/` | ✅ |
| Activity Logger (write-only, immutable audit trail) | `lib/activityLogger.ts` | ✅ |
| Notifications (in-app, created in services) | No dedicated route yet (created inline in services) | ⏳ |
| Admin (user activate/deactivate) | `routes/`, `controllers/` | ✅ |
| Dashboard (summary stats) | Not started | ❌ |
| Invoices (CRUD, PDF, email) | Not started | ❌ |
| Reports (analytics, CSV export) | Not started | ❌ |

### Frontend Pages

| # | Screen | Route | Role | Status |
|---|--------|-------|------|--------|
| 1 | Login | `/login` | All | ✅ |
| 2 | Register | `/register` | All | ✅ |
| 3 | Dashboard | `/dashboard` | All | ✅ |
| 4 | Vendor Management | `/vendors` | Officer/Admin | ✅ |
| 5 | RFQ List | `/rfqs` | Officer/Admin | ✅ |
| 6 | RFQ Create | `/rfqs/create` | Officer | ✅ |
| 7 | RFQ Edit | `/rfqs/[id]/edit` | Officer | ✅ |
| 8 | RFQ Detail | `/rfqs/[id]` | Officer/Manager/Vendor | ✅ |
| 9 | Quotation Submit | `/rfqs/[id]/submit` | Vendor | ✅ |
| 10 | Compare Quotations | `/rfqs/[id]/compare` | Officer/Manager | ✅ |
| 11 | Approvals Queue | `/approvals` | Manager | ✅ |
| 12 | Purchase Orders List | `/purchase-orders` | All | ✅ |
| 13 | Purchase Order Detail | `/purchase-orders/[id]` | All | ✅ |
| 14 | Invoices List | `/invoices` | All | ✅ |
| 15 | Invoice Create | `/invoices/create` | Officer/Admin | ✅ |
| 16 | Invoice Detail | `/invoices/[id]` | All | ✅ |
| 17 | Admin Users | `/admin/users` | Admin | ✅ |
| 18 | Activity Logs | `/activity-logs` | All | ❌ |
| 19 | Reports | `/reports` | Admin/Manager | ❌ |

---

## Recent Changes (This Session)

### 1. L1 Remarks Visible to L2 Manager
- **Problem**: When L2 opened the approvals queue, they saw their PENDING card but had no visibility into what L1 wrote in their remarks.
- **Solution**: Modified `backend/src/services/approval.service.ts:listApprovals()` to enrich each approval record with a `siblingApproval` field containing the other level's approval data (status, remarks, approver name).
- **Frontend**: Added amber-highlighted info box in the L2 approval card showing L1's remark and the L1 approver's name. Both levels still require their own remarks before confirming approve/reject.
- **Files changed**:
  - `backend/src/services/approval.service.ts` — enriched list query
  - `frontend/services/approval.ts` — added `siblingApproval` type
  - `frontend/app/(dashboard)/approvals/page.tsx` — L1 remark display box

### 2. Purchase Orders Module (Backend + Frontend)
- **Backend** (4 files):
  - `backend/src/validations/purchaseOrder.validation.ts` — Zod schema for status update (DRAFT/APPROVED/FULFILLED)
  - `backend/src/repositories/purchaseOrder.repository.ts` — list (pagination, vendor filter), getById (vendor, quotation→rfq→items), updateStatus
  - `backend/src/services/purchaseOrder.service.ts` — role-based filtering (vendors see only their POs via userId→vendorId resolution), access control, activity logging
  - `backend/src/controllers/purchaseOrder.controller.ts` — list, detail, updateStatus handlers with error mapping
  - `backend/src/routes/purchaseOrder.routes.ts` — GET `/`, GET `/:id`, PATCH `/:id/status` with role guards
  - `backend/src/index.ts` — mounted at `/api/v1/purchase-orders`
- **Frontend** (3 files):
  - `frontend/services/purchaseOrder.ts` — all 3 API calls
  - `frontend/app/(dashboard)/purchase-orders/page.tsx` — list with status filter tabs (ALL/DRAFT/APPROVED/FULFILLED), pagination, role-based columns (vendor name, PO number, grand total, invoice count)
  - `frontend/app/(dashboard)/purchase-orders/[id]/page.tsx` — detail with vendor card, RFQ reference, line items table, financial summary, invoice history, Approve PO / Generate Invoice action buttons

### 3. Level Indicator in Approvals Page
- Added a "You are assigned as: L1 / L2" badge at the top of the approvals queue so managers can see their approval level(s) at a glance.

### 4. Admin User Management (Backend + Frontend)
- **Backend**: `admin.controller.ts` + `admin.routes.ts` — `GET /api/v1/admin/users`, `PATCH /users/:id/activate`, `PATCH /users/:id/approval-level`
- **Frontend**: `/admin/users` — table of all users, activate/deactivate toggle, dropdown to assign L1/L2 approval level to managers

### 5. Schema Changes
- `User` model: added `approvalLevel` (Int?) — allows Admin to explicitly assign L1/L2
- `Invoice` model: added `paidAt` (DateTime?) — tracks when invoice was paid

### 6. Seed Data (Rich Demo)
- **7 users**: admin, 2 managers (L1/L2), officer, 3 vendors
- **3 vendor profiles**: TechMart India (IT Hardware), Global Office Supplies (Office Supplies), IndustrieBedarf GmbH (Industrial Equipment)
- **2 RFQs** published with line items:
  - "Office Laptops & Peripherals" — 50 laptops, 30 monitors, 100 keyboards — 2 vendors assigned
  - "Annual Office Stationery Supply" — 500 cartons A4 paper, 20 toner cartridges, 200 stationery kits — 2 vendors assigned
- **4 quotations** submitted with pricing (all with 18% GST, delivery days)

### 7. Invoice Module (Backend + Frontend)
- **Schema**: Added `paidAt` field to Invoice model, pushed to DB
- **Backend** (5 files):
  - `backend/src/validations/invoice.validation.ts` — Zod schema for create invoice
  - `backend/src/repositories/invoice.repository.ts` — create, list (paginated), getById (full includes), markAsPaid, getNextInvoiceNumber (INV-YYYY-NNNNNN)
  - `backend/src/services/invoice.service.ts` — create from PO (CGST 9% + SGST 9% calculation), list, detail, mark paid, activity logging
  - `backend/src/controllers/invoice.controller.ts` — POST create, GET list, GET detail, PATCH pay
  - `backend/src/routes/invoice.routes.ts` — mounted at `/api/v1/invoices/*`
  - `backend/src/index.ts` — registered router
  - `frontend/services/invoice.ts` — all 4 API calls + TypeScript types
  - `frontend/app/(dashboard)/invoices/page.tsx` — list with status filter tabs (Pending/Paid/Overdue), pagination, vendor info
  - `frontend/app/(dashboard)/invoices/create/page.tsx` — create from PO with date pickers, GST preview, validation
  - `frontend/app/(dashboard)/invoices/[id]/page.tsx` — detail with vendor card, line items, CGST/SGST breakdown, Mark as Paid with remarks, Download PDF

### 8. UX Improvements (Invoice + PO)
- **`paidRemarks` field**: Added to Invoice schema — officer enters remarks when marking paid (cheque ref, bank transfer, etc.). Displayed in green Paid banner. Also logged to activity log.
- **Download PDF**: Always-visible button on invoice detail page. Opens standalone print-friendly page at `/invoice-print/[id]` (no sidebar, auto-triggers print dialog → Save as PDF).
- **PO List columns**: Replaced generic "Invoices" column with dedicated **Payment** (✓ Paid / Pending / —) and **Fulfillment** (✓ Fulfilled / In Progress / Draft) columns for better at-a-glance status tracking.
- **PO Detail lifecycle**: Invoices are now clickable links → invoice detail. When invoice is PAID, "Mark as Fulfilled" button appears to complete the PO lifecycle.

---

## Database: 13 Tables

| Table | Purpose |
|-------|---------|
| `users` | Auth + roles. ENUM: admin/manager/officer/vendor |
| `vendors` | Vendor registry. Status ENUM: active/pending/blocked |
| `rfqs` | Requests for Quotation. Status: draft/published/closed |
| `rfq_line_items` | Items within an RFQ |
| `rfq_vendors` | Junction: which vendors assigned to which RFQ |
| `rfq_attachments` | File uploads linked to RFQ |
| `quotations` | Vendor's submitted quote for an RFQ |
| `quotation_items` | Per-item pricing in a quotation |
| `approvals` | L1/L2 approval chain. Status: pending/approved/rejected. L1 = first manager in DB, L2 = second manager in DB (auto-assigned) |
| `purchase_orders` | Auto-generated from approved quotation. PO-YYYY-NNNN |
| `invoices` | GST invoice from PO. CGST(9%) + SGST(9%) |
| `activity_logs` | **IMMUTABLE** audit trail. Write-only. No update/delete. |
| `notifications` | In-app notifications per user |

> **CRITICAL**: `activity_logs` is write-only. Never expose UPDATE/DELETE on this table.

---

## API Endpoints

| Module | Path | Status |
|--------|------|--------|
| Auth | `/api/v1/auth/*` | ✅ |
| Vendors | `/api/v1/vendors/*` | ✅ |
| RFQs | `/api/v1/rfqs/*` | ✅ |
| Quotations | `/api/v1/quotations/*` | ✅ |
| Approvals | `/api/v1/approvals/*` | ✅ |
| Purchase Orders | `/api/v1/purchase-orders/*` | ✅ |
| Invoices | `/api/v1/invoices/*` | ✅ |
| Admin (users, activate, approval-level) | `/api/v1/admin/*` | ✅ |
| Dashboard | `/api/v1/dashboard/*` | ❌ |
| Activity Logs | `/api/v1/activity-logs/*` | ❌ |
| Reports | `/api/v1/reports/*` | ❌ |
| Notifications | `/api/v1/notifications/*` | ❌ |

---

## Standard API Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Human-readable message",
  "error": null
}
```
Error responses:
```json
{
  "success": false,
  "data": null,
  "error": "User-friendly error message",
  "field": "affected_field_if_validation_error"
}
```

---

## Prisma Database Commands

Run these inside `backend/` directory:

```bash
# Sync schema to DB (fast prototyping)
npx prisma db push

# Generate types after schema change
npx prisma generate

# Create versioned migration
npx prisma migrate dev --name <migration_name>

# Populate seed data
npx prisma db seed

# Visual DB editor
npx prisma studio
```

> **Note**: In Prisma 7, the `DATABASE_URL` is configured in `prisma.config.ts`, NOT in `schema.prisma` datasource block.

---

## Design System: Odoo Purple Theme

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#714B67` | Sidebar background, buttons, active states |
| Primary Dark | `#5a3d54` | Hover states, header |
| Primary Light | `#8b6080` | Subtle highlights |
| White | `#ffffff` | Content area background |
| Surface | `#f8f5f7` | Card backgrounds |
| Text Primary | `#2d2d2d` | Main content text |
| Text Muted | `#6b7280` | Secondary text |
| Success | `#16a34a` | Active status badges, lowest price highlight |
| Warning | `#d97706` | Pending status |
| Danger | `#dc2626` | Blocked status, errors |

**Font**: Inter (Google Fonts)

---

## Approval Chain Design Decision

**Finalized Design**: Auto-assign the **first 2 `manager` role users** from the DB when the approval workflow is triggered:
- **L1** = `manager` user with the lowest `id` (e.g., Procurement Head — `manager1@example.com`)
- **L2** = `manager` user with the 2nd lowest `id` (e.g., Finance Manager — `manager2@example.com`)

**Why this approach**:
- Matches the mockup (specific named approvers, not "all managers")
- No extra officer UI needed to pick approvers
- Simple to seed and demo — just create 2 manager accounts
- Clean L1 → L2 sequential chain enforced automatically

**Implementation**: When officer selects vendor in comparison screen → service queries `prisma.user.findMany({ where: { role: 'manager' }, orderBy: { id: 'asc' }, take: 2 })` → creates L1 and L2 approval records simultaneously, but only L1 is `pending` (L2 stays `waiting` until L1 approves).

**Sibling Approval Enrichment**: When the approvals list is fetched, the service enriches each approval with its sibling (other level for the same quotation). This lets L2 see L1's remarks directly in the UI.

---

## Email Service

**Provider: Resend API** (`resend` npm package — NOT Nodemailer SMTP)
- Install: `npm install resend` in backend
- API key stored in `RESEND_API_KEY` env variable
- Usage: `new Resend(process.env.RESEND_API_KEY).emails.send({...})`
- Use for: invoice email delivery, approval notifications

---

## Security Rules (Critical for Evaluation)
- Passwords: bcrypt min 10 rounds
- JWT: 30-min access token, 7-day refresh token
- All protected routes: `requireAuth` + `requireRole([...])` middleware
- Input validation: Zod on ALL endpoints
- File uploads: type whitelist (PDF/JPG/PNG), max 5MB
- CORS: restrict to `FRONTEND_URL` from `.env`
- NEVER expose stack traces or DB errors to client
- `activity_logs`: no UPDATE or DELETE anywhere in codebase

---

## Seed Demo Accounts
After running `npx prisma db seed` (from `backend/` directory):
| Email | Password | Role | Approval Level |
|-------|----------|------|----------------|
| admin@example.com | admin123 | Admin | — |
| manager1@example.com | manager123 | Manager | **L1 approver** (auto-assigned) |
| manager2@example.com | manager456 | Manager | **L2 approver** (auto-assigned) |
| officer@example.com | officer123 | Officer | Creates RFQs, compares quotes |
| vendor1@example.com | vendor123 | Vendor | Submits quotations |
| vendor2@example.com | vendor456 | Vendor | Submits quotations |
| vendor3@example.com | vendor789 | Vendor | Submits quotations |
