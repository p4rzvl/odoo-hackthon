# Backend AI Context — VendorBridge ERP

## Overview
TypeScript Express backend for VendorBridge — a Procurement & Vendor Management ERP.
All ERP modules (vendors, RFQs, quotations, approvals, POs, invoices, reports) are served here as RESTful APIs.

---

## Stack
- **Language**: TypeScript (`ts-node` in dev, `tsc` for production build)
- **Framework**: Express.js
- **ORM**: Prisma 7 (with `@prisma/adapter-pg` driver adapter for Neon compatibility)
- **Validation**: Zod schemas on all routes
- **Auth**: JWT access tokens (30min) + refresh tokens (7d) stored in DB, sent via HTTP-only secure cookies (`accessToken` and `refreshToken`) for enhanced security.

---

## Folder Structure
```
src/
├── controllers/      → extract params, call service, return response
├── services/         → business logic, calculations, orchestrations
├── repositories/     → Prisma DB queries (data access layer)
├── routes/           → Express Router definitions
├── validations/      → Zod schemas per module
├── middleware/       → auth, roleGuard, errorHandler, multer upload
├── lib/
│   ├── prisma.ts     → Prisma Client singleton with PG adapter
│   ├── response.ts   → sendSuccess() / sendError() helpers
│   └── activityLogger.ts → shared logActivity() helper [NEW]
└── types/
    └── index.ts      → AuthenticatedRequest interface + other types
```

---

## Database (13 Tables)

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | id, email, passwordHash, role, firstName, lastName, phone, country, isActive | ENUM role: admin/manager/officer/vendor |
| `vendors` | id, userId, companyName, gstNumber, category, contactNumber, address, status | ENUM status: active/pending/blocked |
| `rfqs` | id, title, category, description, deadline, status, createdBy | ENUM status: draft/published/closed |
| `rfq_line_items` | id, rfqId, itemName, quantity, unit | belongs to rfq |
| `rfq_vendors` | id, rfqId, vendorId, invitedAt | junction table |
| `rfq_attachments` | id, rfqId, fileName, filePath, uploadedAt | local file storage |
| `quotations` | id, rfqId, vendorId, gstPercent, subtotal, taxAmount, grandTotal, status | ENUM: draft/submitted/selected/rejected |
| `quotation_items` | id, quotationId, rfqLineItemId, unitPrice, totalPrice, deliveryDays | per-item pricing |
| `approvals` | id, quotationId, approverId, level, status, remarks, assignedAt, actionedAt | L1 or L2. **L1 = first manager by ID, L2 = second manager by ID. Auto-assigned on vendor selection.** |
| `purchase_orders` | id, poNumber, quotationId, vendorId, totalAmount, status | Auto PO-YYYY-NNNN |
| `invoices` | id, invoiceNumber, poId, invoiceDate, dueDate, subtotal, cgst, sgst, grandTotal, status | CGST(9%) + SGST(9%) |
| `activity_logs` | id, actorId, actionType, description, entityId, entityType, createdAt | **WRITE-ONLY. NO update/delete EVER.** |
| `notifications` | id, userId, message, type, isRead, relatedEntityId, entityType, createdAt | |

> **CRITICAL**: Never add UPDATE or DELETE operations on `activity_logs` table — it must remain immutable.

---

## Auth Policy (CRITICAL — Do Not Change)

### Registration Rules
- **Public `/register` endpoint allows only**: `OFFICER`, `VENDOR`, `MANAGER` roles
- **ADMIN role is completely blocked** from self-registration — Zod validation returns `403 Forbidden` if anyone sends `role: ADMIN`
- **New registrations default to `isActive: false` (PENDING)** — user cannot log in until Admin activates them
- **No tokens are issued on registration** — user must wait for activation, then log in manually
- **Admin accounts are created ONLY via `prisma/seed.ts`** seeding script

### Login Rules
- Login checks `isActive === true` — if false, returns `403 Forbidden` with message `"Your account is pending activation by an Admin. Please wait for approval."`
- Blocked/deactivated users are also rejected.
- Successful login sets `accessToken` and `refreshToken` as HttpOnly, Secure, SameSite=Strict cookies; no tokens are returned in the response body.

### Onboarding Flow
```
1. User self-registers → isActive=false (PENDING)
2. Admin logs in (seeded account) → sees pending users in /admin/users list
3. Admin clicks "Activate" → isActive=true
4. User logs in → tokens issued → access granted
```

### Admin Module (to build later)
- `GET  /api/v1/admin/users`          → list all users with filters (Admin only)
- `PATCH /api/v1/admin/users/:id/activate`  → set isActive=true (Admin only)
- `PATCH /api/v1/admin/users/:id/deactivate` → set isActive=false (Admin only)

---

## Prisma 7 Notes
- `DATABASE_URL` is configured in `prisma.config.ts`, NOT in `schema.prisma` datasource block.
- Always import prisma client via `import prisma from '../lib/prisma'`
- After any schema change: `npx prisma generate` then `npx prisma db push`

---

## API Standards
- Base URL: `/api/v1/`
- Always use `sendSuccess(res, data, message, statusCode)` or `sendError(res, message, statusCode, field?)`
- Pagination: `?page=1&limit=20` on all list endpoints
- HTTP status codes: 200 (ok), 201 (created), 400 (bad request), 401 (unauth), 403 (forbidden), 404 (not found), 500 (server error)

---

## Middleware Pattern
```typescript
// Auth-only route
router.get('/rfqs', requireAuth, rfqController.list);

// Role-restricted route
router.post('/vendors', requireAuth, requireRole(['admin', 'officer']), vendorController.create);

// With validation
router.post('/rfqs', requireAuth, requireRole(['officer']), validate(rfqSchema), rfqController.create);
```

---

## Activity Log Helper (use everywhere)
```typescript
import { logActivity } from '../lib/activityLogger';

await logActivity({
  actorId: req.user.id,
  actionType: 'RFQ',  // 'RFQ' | 'Approval' | 'Invoice' | 'Vendor' | 'Quotation'
  description: 'RFQ "Office Furniture Q2" published and sent to 3 vendors',
  entityId: rfq.id,
  entityType: 'rfq',
});
```
Call this inside the same Prisma transaction as the triggering action for data consistency.

---

## State Machines

### RFQ: `draft` → `published` → `closed`
### Quotation: `draft` → `submitted` → `selected` | `rejected`
### Approval: `pending` → `approved` | `rejected`
### Purchase Order: `draft` → `approved` → `fulfilled`
### Invoice: `pending_payment` → `paid` | `overdue`

---

## Approval Chain Logic

**Decision**: Auto-assign the first 2 `manager` users (ordered by `id ASC`) when vendor is selected.

```typescript
// In quotation.service.ts → selectVendor()
const managers = await prisma.user.findMany({
  where: { role: 'manager', isActive: true },
  orderBy: { id: 'asc' },
  take: 2,
});
// managers[0] → L1 approver (status: 'pending')
// managers[1] → L2 approver (status: 'waiting' until L1 approves)
```

- On L1 approve → update L2 approval status to `pending` + send Resend notification email
- On any rejection → notify officer, reset workflow status
- Both approvals created in same `prisma.$transaction` for consistency

---

## Email Service — Resend API

**Provider**: Resend (`npm install resend` — NOT Nodemailer)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'VendorBridge <noreply@vendorbridge.com>',
  to: [recipientEmail],
  subject: 'Invoice from VendorBridge',
  html: '<p>Your invoice HTML here</p>',
  attachments: [{ filename: 'invoice.pdf', content: pdfBuffer }],
});
```
Env variable: `RESEND_API_KEY` in `backend/.env`

---

## PO Number Format
Auto-generate on PO creation:
```typescript
const year = new Date().getFullYear();
const count = await prisma.purchaseOrder.count();
const poNumber = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
// e.g., PO-2025-0001
```

---

## Tax Calculations (Invoice)
- `CGST = subtotal * 0.09` (intra-state 9%)
- `SGST = subtotal * 0.09` (intra-state 9%)
- `grandTotal = subtotal + CGST + SGST`
- For inter-state: use IGST = 18% instead

---

## Environment Variables
Copy `backend/.env.example` to `backend/.env`:
```env
DATABASE_URL=           # Neon PostgreSQL connection
PORT=5001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=             # Strong random string
REFRESH_SECRET=         # Strong random string
RESEND_API_KEY=         # Resend API key (https://resend.com)
EMAIL_FROM=noreply@vendorbridge.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
ORG_NAME=               # Invoice bill-to org name
ORG_ADDRESS=            # Invoice bill-to address
ORG_GSTIN=              # Invoice bill-to GSTIN
```

---

## Module Build Order
1. DB Schema (schema.prisma) → db push + generate
2. Auth update (roles, new user fields)
3. Vendor module
4. RFQ module (with file upload)
5. Quotation module
6. Approval module
7. Purchase Order module
8. Invoice module (PDF + email)
9. Dashboard summary endpoint
10. Activity Logs read endpoint
11. Reports + analytics endpoints
12. Notifications endpoints

---

## Currently Built Endpoints
- `GET /api/health` — server health + DB connectivity check
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me` — retrieve active session profile
- `GET /api/v1/rfqs` — list RFQs with filtering
- `GET /api/v1/rfqs/:id` — retrieve RFQ detailed view
- `POST /api/v1/rfqs` — create new RFQ
- `PUT /api/v1/rfqs/:id` — update RFQ details and sync items
- `POST /api/v1/rfqs/:id/send` — publish RFQ (transitions status to PUBLISHED)
- `POST /api/v1/rfqs/upload` — multipart file uploads to locally stored directories

