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
| Dashboard (live metrics) | ✅ | ✅ | ✅ | — | — |
| Activity Logs | ✅ | ✅ | ✅ | ✅ | — |
| Reports (overview, spend trend, vendor spend, CSV export) | ✅ | ✅ | ✅ | ✅ | — |
| Notifications (in-app + email via Resend) | ✅ | ✅ | ✅ | ✅ | — |

---

## Frontend Pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Login (show/hide password toggle) | `/login` | ✅ |
| 2 | Register | `/register` | ✅ |
| 3 | Dashboard (live data from API, 4 role-specific views) | `/dashboard` | ✅ |
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
| 19 | Activity Logs (filter by type, paginated timeline, color-coded icons) | `/activity-logs` | ✅ |
| 20 | Reports (overview cards, charts, vendor breakdown, CSV) | `/reports` | ✅ |
| 21 | Notifications (bell dropdown + full page, live unread count, type badges, pagination) | `/notifications` | ✅ |

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
- 6 historical POs + invoices (Jan–May 2026) for trend chart — ₹9.5L–₹31L, all 3 vendors, some PAID/some PENDING

### Backend
- Approval service: sibling enrichment (L1 remarks visible to L2)
- Quotation repository: managers selected by `approvalLevel`, not first 2 by ID
- Admin controller: list users, activate/deactivate, set approval level
- PO module: validation, repository, service, controller, routes
- Invoice module: validation, repository, service, controller, routes
- Invoice markAsPaid: accepts `paidRemarks`
- Activity Logs module: repository, service, controller, routes
- Activity Logs role hierarchy: ADMIN all, MANAGER subset, OFFICER subset, VENDOR own only
- Dashboard module: service with real DB queries per role, controller, routes
- Reports module: overview with month filter, spend trend with month range, vendor spend, CSV export, controller, routes
- Notifications module: repository, service, controller, routes, mounted at `/api/v1/notifications`
- Email module: `lib/email.ts` with Resend — 4 templates (invoice, approval, quotation, PO)
- Email wired into RFQ publish (vendor invited), quotation select (L1 notified), L1→L2→PO flow (approval chain), invoice create (vendor gets invoice PDF via email), invoice mark-paid (officer notified)
- Invoice `getById` now includes `purchaseOrder.createdById` for notification routing

### Frontend
- Show/hide password toggle on login
- Level indicator on approvals page
- L1 remarks info box on L2 approval cards
- PO list: payment status + fulfillment columns
- PO detail: clickable invoices, Mark as Fulfilled button
- Invoice detail: remarks input for Mark as Paid, always-visible Download PDF
- Invoice print page at `/invoice-print/[id]` (no sidebar)
- Activity Logs page: timeline view, 8 action type filter tabs, color-coded icons, pagination, clickable detail modal
- Activity Logs role hierarchy: ADMIN sees all, MANAGER sees APPROVAL/PO/RFQ/QUOTATION/INVOICE, OFFICER sees RFQ/QUOTATION/PO/INVOICE/VENDOR, VENDOR sees only their own RFQ/PO/INVOICE/QUOTATION/SYSTEM
- Dashboard: all 4 role views now pull live data from backend API
- Reports page: 6 KPI cards with icons, spend by category progress bars, vendor breakdown table, monthly trend bar chart, month selector dropdown (filters backend data), CSV export
- Notifications service + Topbar bell icon with live unread count badge (30s poll) + dropdown panel (latest 5) + full `/notifications` page with type badges (color-coded), pagination, mark-all-as-read
- Sidebar "Notifications" nav item for all roles
- Middleware: `/notifications` added to protected paths

---

## Completion

**All 12 modules complete!** �️

| Module | Status |
|--------|--------|
| Auth (JWT, Register, Login, Refresh, Logout) | ✅ |
| Vendors (CRUD, status, search) | ✅ |
| RFQs (create, edit, publish, file upload) | ✅ |
| Quotations (submit, edit, compare, select) | ✅ |
| Approvals (L1/L2, sibling remarks, PO auto-gen) | ✅ |
| Purchase Orders (list, detail, status update) | ✅ |
| Invoices (create, list, detail, PDF, mark paid) | ✅ |
| Admin (user management, activation) | ✅ |
| Dashboard (live metrics per role) | ✅ |
| Activity Logs (immutable, role-filtered, paginated) | ✅ |
| Reports (overview, spend trend, bar chart, CSV) | ✅ |
| Notifications & Email (in-app + Resend) | ✅ |
