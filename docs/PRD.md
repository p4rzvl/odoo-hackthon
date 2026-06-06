VendorBridge
Procurement & Vendor Management ERP

PRODUCT REQUIREMENTS DOCUMENT

Odoo Hiring Hackathon 2025
Version 1.0 | June 2025

1. Product Overview
   1.1 Executive Summary
   VendorBridge is a full-stack Procurement & Vendor Management ERP built to digitize and centralize procurement operations for organizations. It provides structured workflows from RFQ creation through vendor quotation comparison, multi-level approvals, purchase order generation, and invoice management.

1.2 Document Metadata
Field Details Field Details
Project VendorBridge Version 1.0
Type Procurement ERP Date June 2025
Hackathon Odoo Hiring Hackathon Status Final

1.3 Vision & Objectives
•Eliminate manual procurement inefficiencies through structured digital workflows
•Enable centralized vendor communication and management
•Provide real-time procurement tracking and analytics
•Demonstrate clean ERP architecture with role-based access control
•Deliver modular, scalable codebase that reflects production-grade standards

1.4 Scope
In Scope:
•All 11 screens as specified in the problem statement and mockups
•4 user roles: Admin, Manager/Approver, Procurement Officer, Vendor
•Full workflow: RFQ → Quotation → Comparison → Approval → PO → Invoice
•Immutable activity audit logs, reports, and analytics
•PDF invoice download, print support, and email delivery
Out of Scope:
•Real payment gateway integration
•Multi-language (i18n) support
•Mobile native app

2. User Roles & Permissions
   2.1 Role Matrix
   Role Name Permissions
   Admin System Admin Manage users, vendors, view all analytics, full system access
   Manager Procurement Manager / Finance Approve or reject RFQs, monitor workflows, view reports
   Officer Procurement Officer Create RFQs, compare quotations, generate POs and invoices
   Vendor Supplier / Vendor Submit & edit quotations, track RFQ status, view own POs

2.2 Role Notes
•Role is assigned at registration and controlled by Admin
•Vendors only see their own submitted quotations and assigned RFQs
•Managers only see approvals assigned to them in the workflow chain
⚑ Note: Middleware must enforce role-based authorization on every protected API route — frontend role checks alone are not sufficient.

•
All roles authenticated via JWT tokens stored in HTTP-only cookies or Authorization headers

3. Screen Specifications
   3.1 Screen Overview Matrix

# Screen Key Features Role Priority

1 Login / Signup Email+password login, signup, forgot password, role-based auth, session handling, validation All P0
2 Registration Photo, first/last name, email, phone, role selection, country, additional info All P0
3 Dashboard Active RFQs, pending approvals, POs this month, overdue invoices, spending trends, quick actions Officer, Manager, Admin P0
4 Vendor Management Add/edit vendor, status tracking (Active/Pending/Blocked), GST details, categories, search & filter Officer, Admin P0
5 RFQ Creation RFQ title, category, deadline, line items, vendor assignment, attachments, save draft / send Officer P0
6 Quotation Submission Pricing per line item, delivery timeline, GST/tax %, notes, subtotal + grand total, submit/draft Vendor P0
7 Quotation Comparison Side-by-side compare, lowest price highlight, delivery, vendor rating, payment terms, select & approve Officer, Manager P0
8 Approval Workflow Multi-level approval chain (L1/L2), approval remarks, status tracking, approve/reject actions, timeline Manager P0
9 PO & Invoice Auto PO number, CGST/SGST calc, grand total, bill-to/vendor info, download PDF, print, email invoice Officer, Admin P0
10 Activity & Logs Immutable audit trail, filter by type (RFQ/Approval/Invoice/Vendor), timestamps, write-once log entries All P1
11 Reports & Analytics Total spend, active vendors, PO fulfilment %, overdue invoices, monthly trends chart, export Admin, Manager P1

3.2 Screen 1 & 2 — Authentication (Login, Register)
Purpose
Authenticate users and assign role-based procurement access. Entry point for all users.
Key Features
•Email & password login with JWT token issuance
•Registration form: photo upload, first/last name, email, phone, role selection, country
•Forgot password flow (email reset link)
•Session persistence (token refresh or remember-me option)
•Full input validation with real-time inline error feedback
Screen Observations from Mockup
•Login Screen (Screen 1): Simple login with email/password and Login Button
•Registration Screen (Screen 2): Photo, First Name, Last Name, Email Address, Phone Number, Role dropdown (Admin, Officer), Country, Additional Information text area
⚑ Note: Role field should list all 4 roles. Admin registration should require an existing Admin to approve or use an invite code to prevent unauthorized admin creation.

3.3 Screen 3 — Dashboard
Purpose
Central overview screen for procurement officers and managers to monitor real-time procurement activity at a glance.
Key Features
•Analytics cards: Active RFQs count, Pending Approvals count, POs This Month (value), Overdue Invoices count
•Spending Trends chart for last 6 months (bar/line chart)
•Recent Purchase Orders table: PO#, Vendor, Amount, Status
•Quick action buttons: + New RFQ, Add Vendor, View Invoices
•Sidebar navigation with all 9 modules
Screen Observations from Mockup
•Header: Welcome back, Procurement Officer - Today's Overview
•Cards: 12 Active RFQs | 5 Pending Approvals | $2.3L POs this month | 3 Overdue Invoices
•Sample PO table: PO1/Infra/87000/Approved, PO2/Tech Core/140000/Pending, PO3/OfficeNeed Co/34900/Draft
⚑ Note: All dashboard data must come from live database queries — no hardcoded values in final submission.

3.4 Screen 4 — Vendor Management
Purpose
Maintain a centralized registry of all supplier profiles with lifecycle management.
Key Features
•Add new vendor with company name, category, GST number, contact number
•Status tracking: Active / Pending / Blocked with filter tabs showing counts (All 28, Active 21, Pending 4, Blocked 3)
•Searchable by vendor name, GST number, or category
•Table view: Vendor Name | Category | GST No. | Contact No. | Status | Action (View)
•Status update (Admin can block/unblock vendors)
Screen Observations from Mockup
•Sample vendors: Infra Supplies Pvt Ltd (Construction, Active), Tech Core LTD (IT, Active), FastLog Transport (Logistics, Blocked)
•GST numbers shown in 15-char format: 27AABCS1429BZ0
⚑ Note: Blocked vendors must be excluded from new RFQ vendor assignments automatically.

3.5 Screen 5 — RFQ Creation
Purpose
Allow Procurement Officers to initiate procurement workflows by creating structured Requests for Quotation.
Key Features
•Multi-step form (3 visible steps in mockup): Basic details → Line Items → Vendor Assignment
•Fields: RFQ Title (required), Category, Deadline (required, future date), Description
•Dynamic Line Items: Item name, Quantity, Unit — Add/remove line items
•Vendor Assignment: Select from active vendors, multi-select with + add vendor
•Attachments: Drag & drop file upload (PDF/JPG/PNG, max 5MB each)
•Action buttons: Save & Send to Vendors (publishes RFQ) | Save as Draft
Screen Observations from Mockup
•Example: Office Furniture Procurement Q2, Category: Furniture, Deadline: 15 June 2025
•Line items: Ergonomic Chair x25 NOS, Standing Desks x10 NOS
•Assigned vendors: Infra Supplies Pvt Ltd, TechCore LTD
⚑ Note: Sending RFQ to vendors should trigger a notification to each assigned vendor's account.

3.6 Screen 6 — Vendor Quotation Submission
Purpose
Allow vendors to respond to assigned RFQs by submitting detailed pricing and delivery information.
Key Features
•RFQ summary shown at top (title, deadline, line items)
•Quotation table: Item | Qty (pre-filled) | Unit Price | Total | Delivery (days)
•GST / Tax % field with auto-calculated tax amount
•Subtotal, GST amount, Grand Total auto-calculated on input
•Notes / payment terms text area
•Actions: Submit Quotation (final) | Save Draft (editable later until deadline)
Screen Observations from Mockup
•RFQ: Office Furniture Procurement Q2 — deadline 15 June 2025
•Sample: Ergonomic Chair x25 @ 3500 = 87,500 | Delivery 7 days
•Tax: 18% | Subtotal: 1,69,599 | GST: 30,510 | Grand Total: 2,00,010
•Payment terms note field shown
⚑ Note: Vendors cannot edit a submitted quotation unless the RFQ deadline has not passed. Add an Edit button visible before submission deadline.

3.7 Screen 7 — Quotation Comparison
Purpose
Provide procurement teams with a structured side-by-side comparison of all received quotations to make informed vendor selection.
Key Features
•Comparison table: Criteria | Vendor 1 | Vendor 2 | Vendor 3 columns
•Rows: Grand Total | GST % | Delivery (days) | Vendor Rating | Payment Terms
•Lowest price cell highlighted in green
•Vendor rating indicators (X/5 score)
•Select button per vendor — selecting initiates the approval workflow
•Sorting and filtering by criteria
Screen Observations from Mockup
•RFQ: Office Furniture Q2 — 3 Quotations Received
•Infra Supplies (Lowest) 185000 | TechCore LTD 214800 | Office Need Co. 200010
•Delivery: 10 | 7 | 14 days. Ratings: 4.5 | 3.8 | 4.2. Payment: 30 | 15 | 30 days
•Footer note: Green = lowest price, selecting vendor initiates the approval workflow
⚑ Note: Selecting a vendor must automatically create a Pending approval record and notify assigned approvers.

3.8 Screen 8 — Approval Workflow
Purpose
Enforce structured multi-level procurement approvals with full transparency and audit trail.
Key Features
•Visual approval chain stepper: Submitted → L1 Review → L2 Approval → Generate PO
•Approver details: Name, role, action timestamp or 'Awaiting' status
•Approval Remarks text area for approver comments
•Quotation Summary panel: Vendor, Total, Delivery, Rating
•Approve and Reject action buttons (Reject requires remarks)
•Email/notification sent to next approver after each level approval
Screen Observations from Mockup
•RFQ: Office Furniture Q2 — Vendor: Infra Supplies — 185,400
•L1: Rahul Mehta (Procurement Head) — Approved on May 20, 10:32 AM
•L2: Priya Shah (Finance Manager) — Awaiting, Assigned May 21
•Quotation Summary: Infra Supplies Pvt Ltd | 1,85,400 | 10 days | 4.5/5
⚑ Note: Rejection at any level must return the workflow to the Officer with the rejection reason. Officer may then select a different vendor and re-initiate approval.

3.9 Screen 9 — Purchase Order & Invoice Generation
Purpose
Convert fully approved quotations into official purchase orders and generate GST-compliant invoices with delivery and payment capabilities.
Key Features
•Auto-generated PO number (format: PO-YYYY-NNNN, e.g., PO-2025-0068)
•Bill To section: Organization name, address, GSTIN
•Vendor section: Company name, address, GSTIN
•Line items table from approved quotation
•Tax breakdown: Subtotal | CGST (9%) | SGST (9%) | Grand Total
•Invoice dates: Invoice Date, Due Date (configurable payment terms)
•Status badge: Pending Payment / Paid with Mark as Paid button
•Action buttons: Download PDF | Print | Email Invoice
Screen Observations from Mockup
•Bill To: Your Organization Name, 123 Business Park, Ahmedabad, GSTIN: 25383438AFB
•Vendor: Infra Supplies Pvt Ltd, 456 Industrial Estate, Surat, GSTIN: 343434DB4523
•PO-2025-0068 | PO Date: 21 May 2025 | Invoice Date: 22 May 2025 | Due: 21 June 2025
•Subtotal: 1,69,500 | CGST (9%): 15,255 | SGST (9%): 15,255 | Grand Total: 2,00,010
⚑ Note: CGST and SGST are split GST components (intra-state). For inter-state, use IGST (18%). The tax type should be configurable or determined by vendor/buyer state.

3.10 Screen 10 — Activity & Logs
Purpose
Maintain an immutable procurement audit trail visible to all authorized users for transparency and compliance.
Key Features
•Filter tabs: All | RFQ | Approvals | Invoices | Vendors
•Timeline entries: action description + timestamp
•Entries are write-once — no edit or delete capability
•Audit log entries visible in chronological order (newest first)
Screen Observations from Mockup
•Entry 1: Quotation selected — Infra Supplies selected for Office Furniture Q2 (23 May 2025, 9:15 PM)
•Entry 2: Approval pending — PO-2024 awaiting L2 approval by Priya Shah (22 May 2025)
•Entry 3: RFQ published — Office Furniture Q2 sent to 3 vendors (19 May 2025)
•Entry 4: Vendor added — FastLog Transport registered and pending verification (18 May 2025)
•Note on mockup: 'Audit logs must be immutable. These entries must be write-once, no edit or delete. Make sure your DB schema reflects this.'
⚑ Note: Database-level: Do not add UPDATE or DELETE permissions on the activity_logs table. Enforce in application layer and DB constraints.

3.11 Screen 11 — Reports & Analytics
Purpose
Provide procurement leadership with actionable insights on spending, vendor performance, and procurement efficiency.
Key Features
•Summary KPI cards: Total Spend | Active Vendors | PO Fulfilment % | Overdue Invoices
•Monthly procurement trends chart (bar/line)
•Vendor performance table with ratings
•Exportable reports (CSV or PDF)
•Date filter for report period (e.g., May 2025)
Screen Observations from Mockup
•KPIs for May 2025: 12.4L Total Spend | 28 Active Vendors | 94% PO Fulfilment | 3 Overdue Invoices
•Export button visible on top right
⚑ Note: All analytics must be computed from live database aggregation queries — not cached static numbers.

4. Database Design
   4.1 Design Principles
   •Use PostgreSQL or MySQL — local installation required (no BaaS platforms)
   •All schema changes managed through versioned migration scripts
   •Foreign keys enforced at database level for referential integrity
   •Indexes on all foreign keys, status columns, and frequently searched fields
   •Timestamps (created_at, updated_at) on all mutable tables
   •activity_logs table must be write-only — no UPDATE/DELETE in application code

4.2 Entity-Relationship Overview
Core relationship chain:
users ──< rfqs ──< rfq_line_items
rfqs ──< rfq_vendors >── vendors
rfqs ──< quotations >── vendors
quotations ──< quotation_items
quotations ──< approvals >── users (approvers)
quotations ──1 purchase_orders ──1 invoices
All entities ──< activity_logs (write-only)

4.3 Table Specifications
Table Name Columns & Notes
users id (PK), email, password_hash, first_name, last_name, phone, role (ENUM: admin/manager/officer/vendor), country, is_active, created_at
vendors id (PK), user_id (FK→users), company_name, gst_number, category, contact_number, address, status (ENUM: active/pending/blocked), created_at, updated_at
rfqs id (PK), title, category, description, deadline, status (ENUM: draft/published/closed), created_by (FK→users), created_at, updated_at
rfq_line_items id (PK), rfq_id (FK→rfqs), item_name, quantity, unit, created_at
rfq_vendors id (PK), rfq_id (FK→rfqs), vendor_id (FK→vendors), invited_at — Junction table
rfq_attachments id (PK), rfq_id (FK→rfqs), file_name, file_path, uploaded_at
quotations id (PK), rfq_id (FK→rfqs), vendor_id (FK→vendors), gst_percent, payment_terms, notes, subtotal, tax_amount, grand_total, status (ENUM: draft/submitted/selected/rejected), submitted_at
quotation_items id (PK), quotation_id (FK→quotations), rfq_line_item_id (FK→rfq_line_items), unit_price, total_price, delivery_days
approvals id (PK), quotation_id (FK→quotations), approver_id (FK→users), level (L1/L2), status (ENUM: pending/approved/rejected), remarks, assigned_at, actioned_at
purchase_orders id (PK), po_number (UNIQUE, auto-gen), quotation_id (FK→quotations), vendor_id (FK→vendors), total_amount, status (ENUM: draft/approved/fulfilled), created_at
invoices id (PK), invoice_number (UNIQUE), po_id (FK→purchase_orders), invoice_date, due_date, subtotal, cgst, sgst, grand_total, status (ENUM: pending/paid/overdue), created_at
activity_logs id (PK), actor_id (FK→users), action_type (ENUM: RFQ/Approval/Invoice/Vendor/Quotation), description, entity_id, entity_type, created_at — IMMUTABLE: no update/delete allowed
notifications id (PK), user_id (FK→users), message, type, is_read, related_entity_id, entity_type, created_at

⚑ Note: Always use parameterized queries / ORM queries to prevent SQL injection. Never concatenate user input into raw SQL strings.

5. Procurement Workflow & State Machines
   5.1 Master Workflow
   1.Procurement Officer creates an RFQ with line items and assigns vendors → Status: Draft
   2.Officer clicks Save & Send → Status: Published → Notification sent to assigned vendors
   3.Each vendor submits their quotation with pricing and delivery details → Status: Submitted
   4.Officer opens Quotation Comparison screen and selects best vendor
   5.Approval workflow initiated (L1 → L2) → Notifications sent to each approver
   6.All approvers approve → Purchase Order auto-generated (PO-YYYY-NNNN)
   7.Invoice generated from PO with CGST/SGST breakdown
   8.Invoice emailed/downloaded/printed → Status: Pending Payment
   9.Officer marks invoice as paid → Status: Paid
   10.All above actions are logged to immutable activity_logs

5.2 State Transition Table
Entity From State To State Trigger
RFQ Draft Published Officer clicks Save & Send to Vendors
RFQ Published Closed Deadline passes or officer closes manually
Quotation Draft Submitted Vendor clicks Submit Quotation
Quotation Submitted Selected Officer selects vendor in comparison screen
Quotation Submitted Rejected Officer selects a different vendor
Approval Pending Approved (L1) L1 Manager approves in approval workflow
Approval Approved (L1) Approved (L2) L2 Finance Manager approves
Approval Any Pending Rejected Any approver rejects with remarks
Purchase Order Draft Approved All approval levels cleared
Invoice Pending Payment Paid Officer marks as paid
Invoice Pending Payment Overdue Due date passes, cron job updates status

6. API Specification
   6.1 API Standards
   •Base URL: /api/v1/
   •All endpoints return consistent JSON: { success: true/false, data: {...}, error: '...', message: '...' }
   •Authentication: Bearer token in Authorization header
   •Pagination: ?page=1&limit=20 on all list endpoints
   •Error codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

6.2 Endpoint Reference
Module Method Endpoint Description
Auth POST /api/v1/auth/login Authenticate user, return JWT token
Auth POST /api/v1/auth/register Register new user
Auth POST /api/v1/auth/forgot-password Send password reset email
Dashboard GET /api/v1/dashboard/summary Stats: active RFQs, pending approvals, PO count, overdue invoices
Vendors GET /api/v1/vendors List all vendors with filters (status, category, search)
Vendors POST /api/v1/vendors Create new vendor
Vendors PUT /api/v1/vendors/:id Update vendor details or status
Vendors GET /api/v1/vendors/:id Get single vendor details
RFQs GET /api/v1/rfqs List all RFQs with filters
RFQs POST /api/v1/rfqs Create RFQ with line items and vendor assignments
RFQs PUT /api/v1/rfqs/:id Update RFQ (title, deadline, items)
RFQs POST /api/v1/rfqs/:id/send Send RFQ to assigned vendors
Quotations POST /api/v1/quotations Submit vendor quotation for an RFQ
Quotations PUT /api/v1/quotations/:id Update/edit quotation (before submission)
Quotations GET /api/v1/rfqs/:id/quotations Get all quotations for a specific RFQ (comparison view)
Approvals GET /api/v1/approvals List approvals pending for logged-in manager
Approvals POST /api/v1/approvals/:id/approve Approve with optional remarks
Approvals POST /api/v1/approvals/:id/reject Reject with required remarks
Purchase Orders GET /api/v1/purchase-orders List all POs with status filter
Purchase Orders POST /api/v1/purchase-orders Generate PO from approved quotation
Purchase Orders GET /api/v1/purchase-orders/:id Get PO details
Invoices POST /api/v1/invoices Generate invoice from PO
Invoices GET /api/v1/invoices/:id/pdf Download invoice as PDF
Invoices POST /api/v1/invoices/:id/email Email invoice to vendor
Invoices PUT /api/v1/invoices/:id/mark-paid Mark invoice as paid
Activity Logs GET /api/v1/activity-logs Get logs filtered by type, date range
Reports GET /api/v1/reports/summary Spend summary, fulfilment %, vendor count
Reports GET /api/v1/reports/trends Monthly procurement trends data
Reports GET /api/v1/reports/export Export report as CSV

7. Input Validation & Error Handling
   7.1 Validation Rules
   Field Validation Rule Error Message
   Email Valid email format (RFC 5322) Please enter a valid email address
   Password Min 8 chars, 1 uppercase, 1 number, 1 special char Password must be at least 8 characters with uppercase, number, and special character
   Phone 10-digit numeric (India format) Please enter a valid 10-digit phone number
   GST Number 15-char alphanumeric GST format Enter a valid GST number (e.g., 27AABCS1429B1Z5)
   RFQ Deadline Must be a future date Deadline must be a date in the future
   Line Item Qty Positive integer, greater than 0 Quantity must be a positive number
   Unit Price Positive decimal, max 2 decimal places Please enter a valid unit price
   GST % 0–100 numeric range GST percentage must be between 0 and 100
   File Upload PDF, JPG, PNG only; max 5MB per file Only PDF, JPG, PNG files are allowed (max 5MB)
   Approval Remark (reject) Required if action is Reject Remarks are required when rejecting an approval

7.2 Error Handling Strategy
•Validate on backend — never rely solely on frontend validation
•Use a centralized error-handling middleware (Express errorHandler / Django exception handler)
•Return field-level errors for forms: { field: 'email', message: '...' }
•Log all 5xx errors server-side; never expose stack traces to the client
•All async operations wrapped in try-catch with meaningful fallback messages

8. Security Requirements
   •Passwords hashed with bcrypt (min 10 salt rounds) — never stored in plain text
   •JWT tokens: short-lived access tokens (15–60 min) with optional refresh token
   •All protected routes guarded by auth middleware + role-check middleware
   •SQL injection prevention: use ORM/parameterized queries exclusively
   •CORS configured to restrict allowed origins in production
   •Environment variables (.env) for all secrets: DB credentials, JWT secret, SMTP password
   •.env files excluded from Git via .gitignore
   •File uploads validated: type whitelist (PDF/JPG/PNG), size limit (5MB), stored outside web root
   •CSRF protection if using cookie-based auth
   ⚑ Note: Security is a hiring signal. Reviewers will check for plain-text passwords, exposed secrets, and missing role checks.

9. Recommended Technology Stack
   Layer Recommended Notes
   Database PostgreSQL (preferred) / MySQL Use local DB — NO Firebase, Supabase, or MongoDB Atlas
   Backend Node.js + Express / Python + Django/FastAPI RESTful API server with MVC architecture
   ORM Sequelize (Node) / SQLAlchemy (Python) Use migrations for schema versioning
   Authentication JWT (jsonwebtoken) + bcrypt Role-based middleware, refresh tokens optional
   Frontend React.js / Vue.js Component-based, hooks for state, no jQuery
   Styling TailwindCSS / Material UI / Custom CSS Consistent design tokens, responsive grid
   PDF Generation pdfmake / jsPDF / puppeteer Server-side PDF for invoices
   Email Service Nodemailer (SMTP) / SendGrid Invoice email delivery; use .env for credentials
   File Storage Local disk / MinIO For RFQ attachments; no cloud BaaS
   Version Control Git + GitHub All team members must commit; use feature branches
   Testing Jest + Supertest (Node) / pytest Unit + integration tests

10. Non-Functional Requirements
    10.1 Performance
    •All list pages must use server-side pagination (default page size: 20)
    •API response time target: < 500ms for standard queries
    •Dashboard summary computed via optimized aggregate queries with proper indexes
    •Frontend: lazy-load heavy components (charts, PDF viewer)

10.2 Scalability
•Modular backend: each domain (vendors, rfqs, invoices) in its own module/service
•DB connection pooling configured
•Stateless API (no server-side session state) — horizontal scaling ready

10.3 Reliability
•Database transactions used for multi-step operations (PO generation, state transitions)
•Rollback on partial failures (e.g., if invoice creation fails after PO creation)
•Activity log written in same transaction as the triggering action

11. Odoo Evaluation Alignment
    11.1 Evaluation Criteria vs. Implementation
    Odoo Evaluation Criterion VendorBridge Implementation Target
    Database Design (HIGHEST PRIORITY) 13+ normalized tables, proper FK relationships, indexes on frequently queried cols, immutable audit log schema, migration scripts in version control
    Code Architecture & Modularity MVC/layered pattern: routes → controllers → services → models. Separate modules per domain (auth, vendors, rfqs, quotations, approvals, invoices, reports)
    Backend API Design RESTful APIs under /api/v1/, consistent JSON response format, proper HTTP verbs and status codes, versioned endpoints
    Input Validation & Error Handling Backend validation on all inputs, GST format check, user-friendly error messages, try-catch on all async ops, no DB errors exposed to client
    Frontend UI/UX Consistent color scheme, sidebar navigation, responsive layout, loading/error states, interactive dashboard with real data
    Real-Time & Dynamic Data All screens backed by PostgreSQL/MySQL — no hardcoded JSON in final submission
    Version Control (Team Git) All members commit, feature branches, meaningful commit messages, PRs for code review, .gitignore properly configured
    Security JWT auth, bcrypt passwords, parameterized queries, role-based middleware, .env for secrets, CORS configured
    Performance & Scalability Pagination on list views, indexed queries, lazy-loading on frontend, no N+1 query patterns
    Testing & Debugging Unit tests for business logic (calculations, state transitions), integration tests for key API endpoints

11.2 Critical Red Flags to Avoid
•Using Firebase, Supabase, or MongoDB Atlas instead of PostgreSQL/MySQL
•Hardcoded JSON data or static arrays in the final submission
•All Git commits from a single team member
•No input validation or generic error messages
•Copying library code without understanding its purpose
•Only one team member presenting during evaluation
•Missing README or setup documentation
•Plain text passwords stored in database
•activity_logs table that allows edits or deletes

12. Pre-Submission Checklist
    Database & Backend
    •PostgreSQL or MySQL used (not a BaaS platform)
    •Database schema is normalized with proper FK relationships
    •Migration scripts included and documented
    •Indexes created on FK columns, status columns, and search fields
    •activity_logs table is write-only (no update/delete)
    •All API endpoints return consistent JSON response format
    •HTTP verbs and status codes used correctly

Code Quality
•Code is modular — separate controllers, services, models
•Consistent naming conventions throughout codebase
•No commented-out dead code in final submission
•DRY principle followed — no copy-pasted logic blocks
•All team members have meaningful commits in the repository

Input Validation & Security
•All user inputs validated on the backend
•User-friendly error messages for all validation failures
•Passwords hashed with bcrypt
•JWT authentication implemented with role-based middleware
•.env file used for secrets and NOT committed to Git

Frontend & UI
•All 11 screens implemented and functional
•Consistent color scheme and typography throughout
•Responsive layout (works on desktop; mobile a bonus)
•Loading and error states handled on all data-fetching screens
•All data displayed is live from database

Documentation
•README.md with clear setup instructions (clone, install, DB setup, run)
•.env.example file with all required environment variable keys
•API endpoints documented (Postman collection or markdown)
•Database schema documented or ERD included

Testing
•Unit tests for business logic: tax calculations, state transitions, PO number generation
•Integration tests for at least: login, RFQ creation, quotation submission, invoice generation
•Manual testing of all 11 screens completed and verified

Presentation
•Every team member is prepared to present their contribution
•Live demo tested and working end-to-end
•Can explain DB schema and architecture decisions confidently
•Can discuss what was challenging and how it was solved

Appendix: Procurement Workflow Quick Reference
The complete VendorBridge workflow in 8 steps:

11.Officer creates RFQ → assigns vendors → saves & sends
12.Vendors receive notification → submit quotations with pricing
13.Officer opens Quotation Comparison → selects best vendor
14.Approval workflow triggered → L1 approver notified
15.L1 approves → L2 approver notified → L2 approves
16.PO auto-generated from approved quotation
17.Invoice generated from PO → PDF download / print / email
18.Invoice marked as paid → activity log updated

All steps logged immutably in activity_logs with actor, action, entity reference, and timestamp.
