# VendorBridge ERP — Task Tracker

## Legend
- ✅ Done
- ❌ Not Started

---

## Backend Modules

| Module | Routes | Controller | Service | Repository | Validation |
|--------|--------|------------|---------|------------|------------|
| Auth | ✅ | ✅ | ✅ | — | ✅ |
| Admin (users, activate, approval-level) | ✅ | ✅ | — | — | — |
| Vendors | ✅ | ✅ | ✅ | ✅ | ✅ |
| RFQs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quotations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approvals | ✅ | ✅ | ✅ | ✅ | ✅ |
| Purchase Orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invoices (with PDF print) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ❌ | ❌ | ❌ | — | — |
| Activity Logs | ❌ | ❌ | ❌ | ❌ | — |
| Reports | ❌ | ❌ | ❌ | ❌ | — |
| Notifications | ❌ | ❌ | ❌ | — | — |

---

## Frontend Pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Login (show/hide password toggle) | `/login` | ✅ |
| 2 | Register | `/register` | ✅ |
| 3 | Dashboard | `/dashboard` | ✅ |
| 4 | Vendors Directory | `/vendors` | ✅ |
| 5 | RFQ List | `/rfqs` | ✅ |
| 6 | RFQ Create | `/rfqs/create` | ✅ |
| 7 | RFQ Edit | `/rfqs/[id]/edit` | ✅ |
| 8 | RFQ Detail | `/rfqs/[id]` | ✅ |
| 9 | Quotation Submit | `/rfqs/[id]/submit` | ✅ |
| 10 | Compare Quotations | `/rfqs/[id]/compare` | ✅ |
| 11 | Approvals Queue (L1 remarks, level badge) | `/approvals` | ✅ |
| 12 | Purchase Orders List (payment + fulfillment columns) | `/purchase-orders` | ✅ |
| 13 | Purchase Order Detail (clickable invoices, lifecycle) | `/purchase-orders/[id]` | ✅ |
| 14 | Invoices List | `/invoices` | ✅ |
| 15 | Invoice Create | `/invoices/create` | ✅ |
| 16 | Invoice Detail (paid remarks, PDF) | `/invoices/[id]` | ✅ |
| 17 | Invoice Print / PDF | `/invoice-print/[id]` | ✅ |
| 18 | Admin Users (activate, set L1/L2) | `/admin/users` | ✅ |
| 19 | Activity Logs | `/activity-logs` | ❌ |
| 20 | Reports | `/reports` | ❌ |

---

## All Changes This Session

### Schema
- Added `approvalLevel` (Int?) to `User` model
- Added `paidAt` (DateTime?) to `Invoice` model
- Added `paidRemarks` (String?) to `Invoice` model

### Seed Data (run `npx prisma db seed`)
- 7 users with names, countries, proper IDs
- 3 vendor profiles with GST, addresses, categories
- 2 published RFQs with 3 line items each
- 4 submitted quotations with pricing + 18% GST

### Backend
- Approval service: sibling enrichment (L1 remarks visible to L2)
- Quotation repository: managers selected by `approvalLevel`, not first 2 by ID
- Admin controller: list users, activate/deactivate, set approval level
- PO module: validation, repository, service, controller, routes
- Invoice module: validation, repository, service, controller, routes
- Invoice markAsPaid: accepts `paidRemarks`

### Frontend
- Show/hide password toggle on login
- Level indicator on approvals page
- L1 remarks info box on L2 approval cards
- PO list: payment status + fulfillment columns
- PO detail: clickable invoices, Mark as Fulfilled button
- Invoice detail: remarks input for Mark as Paid, always-visible Download PDF
- Invoice print page at `/invoice-print/[id]` (no sidebar)

---

## Next Module Options

| Module | What It Involves |
|--------|-----------------|
| **Activity Logs** | Read-only audit trail page showing all system actions (approvals, PO gen, invoice pay). Light backend + frontend. |
| **Dashboard Live Data** | Replace static dashboard metrics with real API calls (PO count, invoice total, pending approvals). |
| **Reports** | Charts, CSV export, analytics. Moderate work. |

**Recommendation**: Activity Logs is quickest to build and strongest for demo (shows the audit trail is working).
