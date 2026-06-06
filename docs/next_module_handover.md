# Handover: L1/L2 Approvals & PO Auto-Generation Module

This document outlines the detailed specifications and step-by-step guidelines for implementing the L1/L2 approval process and sequential Purchase Order (PO) auto-generation.

---

## 🏗️ 1. Context & Status Flow

When an Officer goes to **Compare Quotation Bids** and clicks **"Select Bid"**, the system initiates a two-level manager approval chain:
1. The chosen `Quotation` transitions: `status: 'SELECTED'`.
2. All other quotations for the same RFQ transition: `status: 'REJECTED'`.
3. An **L1 Approval** record is created with `status: 'PENDING'` for the first manager.
4. An **L2 Approval** record is created with `status: 'WAITING'` for the second manager.
5. The `Rfq` status remains `PUBLISHED` during the review cycle.

---

## 🛠️ 2. Step-by-Step Implementation Tasks

### Task 1: Approval Actions API Endpoints
Create a router for approvals at `/api/v1/approvals` in the backend.

1. **List Approvals (`GET /api/v1/approvals`)**
   - **Access**: `requireRole(['MANAGER', 'ADMIN'])`
   - **Behavior**: Retrieves approval tasks where `approverId = req.user.id`. Allow filtering by `status` (e.g. `PENDING`, `APPROVED`, `REJECTED`).
   - Include the associated `Quotation`, `Vendor` details, and parent `Rfq` title/items.

2. **Approve Selection (`POST /api/v1/approvals/:id/approve`)**
   - **Access**: `requireRole(['MANAGER', 'ADMIN'])`
   - **Input**: `{ remarks: string }`
   - **Behavior**:
     * Verify the approval belongs to `req.user.id` and status is `PENDING`.
     * Update approval record: `status: 'APPROVED'`, `remarks`, `actionedAt: new Date()`.
     * **If Level 1**:
       * Advance Level 2 approval record from `WAITING` to `PENDING`.
       * Dispatch notification to the Level 2 Manager.
     * **If Level 2**:
       * Automatically generate a `PurchaseOrder` in `DRAFT` (or `APPROVED` status depending on PRD).
       * Set the parent `Rfq` status to `CLOSED`.
       * Generate sequential PO number in the format `PO-YYYY-NNNN` (e.g., `PO-2026-0001`).
       * Dispatch a notification to the Officer who created the RFQ and to the winning Vendor.

3. **Reject Selection (`POST /api/v1/approvals/:id/reject`)**
   - **Access**: `requireRole(['MANAGER', 'ADMIN'])`
   - **Input**: `{ remarks: string }` (Mandatory)
   - **Behavior**:
     * Verify the approval belongs to `req.user.id` and status is `PENDING`.
     * Update approval record: `status: 'REJECTED'`, `remarks`, `actionedAt: new Date()`.
     * Reset the selected `Quotation` status back to `SUBMITTED` so the Officer can choose a different winner or negotiate.
     * Set the other level approval record (L1 or L2) to `REJECTED` if it's currently `WAITING`.
     * Dispatch notification back to the RFQ Officer.

---

### Task 2: Approvals Dashboard (Frontend)
Build the user interface for managers to review and action these requests.

1. **Dashboard Route**: Create `frontend/app/(dashboard)/approvals/page.tsx`
   - Restrict view via `<RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>`.
   - Fetch pending and historical approvals.
   - Display a list containing RFQ Title, Vendor Name, Bid Grand Total, and Current Approval Level (L1 or L2).

2. **Approval Action Dialog/Page**:
   - Provide a clear comparative breakdown (L1 Cost reference).
   - Display fields for Remarks.
   - Add **Approve** (purple style `#714B67`) and **Reject** (red style) actions.
   - Trigger toast notifications upon successful action.

---

### Task 3: Purchase Order (PO) Listing & Detail View
1. **Frontend Route**: `frontend/app/(dashboard)/purchase-orders/page.tsx` and `frontend/app/(dashboard)/purchase-orders/[id]/page.tsx`
   - Access for `ADMIN`, `MANAGER`, `OFFICER`, and `VENDOR`.
   - Vendors can only view POs issued to them.
   - Officers/Managers can see all issued POs.
   - Detail view should present the final prices, line items, selected vendor delivery terms, and a button to proceed to invoicing.

---

## 📈 3. Reference Files & Schema Mapping

- **Prisma Schema Reference**: [schema.prisma](file:///Users/dhairyadarji/Developer/odoo%20hackthon/backend/prisma/schema.prisma)
  - `model Approval` (lines 208-222)
  - `model PurchaseOrder` (lines 224-239)
- **Controller Sample**: [approval.controller.ts](file:///Users/dhairyadarji/Developer/odoo%20hackthon/backend/src/controllers/approval.controller.ts)
- **Service Logic**: [approval.service.ts](file:///Users/dhairyadarji/Developer/odoo%20hackthon/backend/src/services/approval.service.ts)
- **Frontend Service**: [approval.ts](file:///Users/dhairyadarji/Developer/odoo%20hackthon/frontend/services/approval.ts)
