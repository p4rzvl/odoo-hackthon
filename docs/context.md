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
5. L1 approves → L2 approver notified → L2 approves
6. PO auto-generated (PO-YYYY-NNNN format)
7. Invoice generated from PO with CGST/SGST breakdown
8. Invoice downloaded as PDF / printed / emailed to vendor
9. Officer marks invoice as paid
10. ALL steps logged immutably in activity_logs
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

### ⚠️ Auth Policy (Critical Rules)

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

| Feature | Status |
|---------|--------|
| Express TypeScript backend with folder structure | ✅ |
| JWT Auth (access 30min + refresh 7d tokens) | ✅ |
| Register / Login / Logout / Refresh Token APIs | ✅ |
| Prisma 7 + Neon PostgreSQL + `@prisma/adapter-pg` | ✅ |
| Global Error Handler middleware | ✅ |
| `sendSuccess` / `sendError` response helpers | ✅ |
| Zod validation middleware | ✅ |
| Database seeding (admin + demo users) | ✅ |
| Frontend Next.js App Router setup | ✅ |
| Login + Register pages (Odoo Purple theme) | ✅ |
| Dashboard skeleton | ✅ |
| Universal Sonner toast notification system | ✅ |
| `.env.example` for backend + frontend | ✅ |

---

## 11 Screens to Build

| # | Screen | Role | Priority |
|---|--------|------|----------|
| 1 | Login | All | P0 ✅ exists |
| 2 | Register | All | P0 ✅ exists (needs update) |
| 3 | Dashboard | Officer/Manager/Admin | P0 |
| 4 | Vendor Management | Officer/Admin | P0 |
| 5 | RFQ Creation | Officer | P0 |
| 6 | Quotation Submission | Vendor | P0 |
| 7 | Quotation Comparison | Officer/Manager | P0 |
| 8 | Approval Workflow | Manager | P0 |
| 9 | PO & Invoice | Officer/Admin | P0 |
| 10 | Activity & Audit Logs | All | P1 |
| 11 | Reports & Analytics | Admin/Manager | P1 |

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

## API Base URL
All endpoints: `/api/v1/`

**Modules:**
- `/api/v1/auth/*` — Register, Login, Logout, Refresh
- `/api/v1/vendors/*` — Vendor CRUD + status management
- `/api/v1/rfqs/*` — RFQ lifecycle + send to vendors
- `/api/v1/quotations/*` — Submit, edit, select quotation
- `/api/v1/approvals/*` — L1/L2 workflow actions
- `/api/v1/purchase-orders/*` — PO generation + detail
- `/api/v1/invoices/*` — Invoice generation, PDF, email, mark-paid
- `/api/v1/dashboard/*` — Summary stats for dashboard
- `/api/v1/activity-logs/*` — Read-only audit log
- `/api/v1/reports/*` — Analytics + CSV export
- `/api/v1/notifications/*` — User notifications

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
