# AI Agent Developer Guide — Backend

This guide outlines the development standards and architectural rules for the VendorBridge backend service.

---

## 1. Core Stack

- **Framework**: Node.js + Express with TypeScript
- **Database**: PostgreSQL (Neon hosted)
- **ORM**: Prisma 7 (with `@prisma/adapter-pg` — see Prisma 7 notes!)
- **Validation**: Zod on all routes
- **Auth**: JWT access + refresh tokens, bcrypt password hashing

---

## 2. Prisma 7 — Critical Notes

> **IMPORTANT**: Prisma 7 manages `DATABASE_URL` in `prisma.config.ts`, NOT inside the `datasource` block of `schema.prisma`. Do NOT add `url = env("DATABASE_URL")` to schema.prisma.

- Always import the Prisma client via: `import prisma from '../lib/prisma'`
- After any schema change, run: `npx prisma generate` then `npx prisma db push`
- Seed config is also declared in `prisma.config.ts` under the `migrations` key

---

## 3. Relational Database Design Rules (Highest Priority)

- **Normalization**: All 13 tables normalized to minimize redundancy
- **Foreign Keys**: Enforce at DB level with Prisma relation definitions
- **Indexes**: Create on FKs, status columns, and search fields
- **Transactions**: Wrap multi-step mutations in `prisma.$transaction([...])`
- **Timestamps**: Every mutable table has `createdAt` + `updatedAt`
- **Immutable Logs**: `activity_logs` table is WRITE-ONLY — no update/delete in any part of codebase

---

## 4. Folder Organization (MVC + Repository Pattern)

```
src/routes/        → Express Router mappings (RESTful paths: /api/v1/...)
src/controllers/   → Extract params, validate, call service, return response
src/services/      → Business logic, calculations, state transitions
src/repositories/  → Prisma queries (all DB reads/writes here only)
src/validations/   → Zod schemas per module
src/middleware/    → requireAuth, requireRole, validate, errorHandler, upload
src/lib/
  prisma.ts        → Prisma Client singleton
  response.ts      → sendSuccess() / sendError() helpers
  activityLogger.ts → logActivity() shared function
src/types/
  index.ts         → AuthenticatedRequest interface
```

---

## 5. API Standards

- **Base URL**: `/api/v1/`
- **Response Format**: Always use `sendSuccess` / `sendError` helpers:
  ```json
  { "success": true, "data": {...}, "message": "..." }
  { "success": false, "error": "User-friendly message", "field": "email" }
  ```
- **Pagination**: All list endpoints accept `?page=1&limit=20`
- **HTTP Status Codes**: 200, 201, 400, 401, 403, 404, 500

---

## 6. Auth & Role Middleware

Protect every route with `requireAuth`. Add `requireRole` for restricted access:
```typescript
// Auth only
router.get('/vendors', requireAuth, vendorController.list);

// Specific roles
router.post('/vendors', requireAuth, requireRole(['admin', 'officer']), vendorController.create);

// With Zod validation
router.post('/rfqs', requireAuth, requireRole(['officer']), validate(rfqSchema), rfqController.create);
```

**Available roles**: `admin`, `manager`, `officer`, `vendor`

---

## 7. Activity Logging (Call on Every State Change)

Use the shared helper — call it inside every service that mutates important state:
```typescript
import { logActivity } from '../lib/activityLogger';

// Inside a transaction alongside the main mutation:
await logActivity({
  actorId: req.user.id,
  actionType: 'RFQ', // 'RFQ' | 'Approval' | 'Invoice' | 'Vendor' | 'Quotation'
  description: 'RFQ "Office Furniture Q2" published to 3 vendors',
  entityId: rfq.id,
  entityType: 'rfq',
});
```

---

## 8. Input Validation & Security

- **Validate ALL inputs** using Zod before controller logic runs
- **Never expose** DB traces, stack traces, or raw Prisma errors to clients
- **Parameterized queries only** — Prisma handles this automatically
- **Passwords**: bcrypt with minimum 10 salt rounds
- **File uploads**: type whitelist (PDF/JPG/PNG only), max 5MB, store in `/uploads/` outside web root
- **CORS**: Restrict to `FRONTEND_URL` from `.env`

---

## 9. Environment Variables

Copy `.env.example` to `.env` and fill in all values:
```env
DATABASE_URL=           # Neon PostgreSQL connection
PORT=5001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=             # Strong random string
REFRESH_SECRET=         # Strong random string
RESEND_API_KEY=         # Your Resend API key from resend.com
EMAIL_FROM=noreply@vendorbridge.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
ORG_NAME=               # Invoice bill-to org name
ORG_ADDRESS=            # Invoice bill-to address
ORG_GSTIN=              # Invoice bill-to GSTIN
```
> **Never commit** `.env` to Git. It's gitignored. Commit only `.env.example`.

---

## 10. Email — Resend API

We use **Resend** (not Nodemailer) for all outbound email:
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'VendorBridge <noreply@vendorbridge.com>',
  to: [recipientEmail],
  subject: 'Your Invoice from VendorBridge',
  html: invoiceHtml,
  attachments: [{ filename: 'invoice.pdf', content: pdfBuffer }],
});
```
Install: `npm install resend` in backend directory.

---

## 10. Key Business Rules

- **Blocked vendors**: Automatically excluded from RFQ vendor assignment queries
- **Quotation editing**: Vendor can edit only if `status = draft` AND RFQ deadline hasn't passed
- **Approval chain**: Auto-assign first 2 `manager` users (by `id ASC`) as L1 and L2 when vendor selected. L1 goes `pending` first. L2 only becomes `pending` after L1 approves.
- **Rejection**: Any approver rejects → notify officer with reason, workflow status resets
- **PO generation**: Auto-triggered when all approval levels pass. Format: `PO-YYYY-NNNN`
- **Invoice tax**: CGST(9%) + SGST(9%) = 18% for intra-state. Grand Total = subtotal + CGST + SGST
- **Invoice overdue**: Check-on-read: if `dueDate < now` and status is `pending_payment` → return `overdue`

---

## 11. Project Context

- Full project context (all screens, tables, workflow): [`docs/context.md`](../../docs/context.md)
- Full API specification: [`docs/PRD.md`](../../docs/PRD.md) (Section 6)
- Database schema spec: [`docs/PRD.md`](../../docs/PRD.md) (Section 4)
- UI mockups: [`docs/VendorBridge - 8 hours.svg`](../../docs/VendorBridge%20-%208%20hours.svg)
