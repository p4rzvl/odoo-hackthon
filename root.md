# VendorBridge — Root Navigation Guide
### For AI Agents: Read this FIRST to understand the project structure

---

## What Is This Project?

**VendorBridge** is a full-stack Procurement & Vendor Management ERP for the Odoo Hiring Hackathon 2025.

**Core Workflow**:
```
RFQ → Vendor Quotations → Comparison → L1/L2 Approvals → Purchase Order → GST Invoice → PDF/Email
```

**Stack**: TypeScript Express (backend) + Next.js App Router (frontend) + Neon PostgreSQL via Prisma 7

---

## 📁 Complete File & Directory Map

```
/odoo-hackthon/                          ← PROJECT ROOT
│
├── root.md                              ← YOU ARE HERE — master navigation guide
├── README.md                            ← Setup instructions (how to start the project)
├── .env.example                         ← Root-level env template reference
├── .gitignore                           ← Git ignore rules
│
├── docs/                                ← ALL PROJECT DOCUMENTATION
│   ├── context.md                       ← ⭐ MAIN PROJECT CONTEXT (read this first!)
│   ├── problem-statment.md              ← Original hackathon problem statement
│   ├── PRD.md                           ← Full Product Requirements Document (detailed spec)
│   ├── VendorBridge - 8 hours.svg       ← UI mockup screens (visual reference)
│   ├── api.docs.md                      ← API endpoint documentation
│   ├── api.md                           ← Quick API reference
│   ├── architecture.md                  ← System architecture overview
│   ├── database.md                      ← Database schema notes
│   ├── design.md                        ← Design tokens & theme reference
│   ├── extra.md                         ← Stack decisions & rationale notes
│   ├── todo.md                          ← High-level todo list
│   └── ODOO_HACKATHON_CODE_GUIDE.md     ← Odoo evaluation criteria guide
│
├── ai/                                  ← ROOT-LEVEL AI CONTEXT FILES
│   ├── AGENT.md                         ← Root AI agent rules
│   ├── Design.md                        ← UI design system (Odoo Purple theme)
│   ├── Test_desing.md                   ← Alternative design spec reference
│   ├── Pending.md                       ← Pending items tracker
│   ├── Readme.md                        ← AI-facing readme
│   └── TODO.md                          ← AI task list
│
├── backend/                             ← EXPRESS TYPESCRIPT API SERVER
│   ├── .env                             ← Active env (NOT in git)
│   ├── .env.example                     ← ⭐ Env template (copy this → .env)
│   ├── prisma.config.ts                 ← Prisma 7 config (DATABASE_URL goes here, not schema.prisma!)
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── ai/                              ← BACKEND AI CONTEXT FILES
│   │   ├── Context.md                   ← ⭐ Backend context (tables, rules, state machines)
│   │   ├── guide.md                     ← ⭐ Backend dev guide (standards, patterns, APIs)
│   │   ├── connection_guide.md          ← Neon DB connection setup guide
│   │   └── Todo.md                      ← Backend task list
│   │
│   ├── prisma/
│   │   ├── schema.prisma                ← ⭐ Database schema (13 tables)
│   │   └── seed.ts                      ← Demo data seeder (run: npx prisma db seed)
│   │
│   └── src/
│       ├── index.ts                     ← Express app entry point
│       ├── controllers/                 ← Route handlers (extract params → call service)
│       ├── services/                    ← Business logic layer
│       ├── repositories/                ← Prisma DB queries (data access layer)
│       ├── routes/                      ← Express Router definitions
│       ├── validations/                 ← Zod schemas per module
│       ├── middleware/                  ← auth, roleGuard, errorHandler, multer
│       ├── lib/
│       │   ├── prisma.ts                ← Prisma Client singleton (always import from here)
│       │   ├── response.ts              ← sendSuccess() / sendError() helpers
│       │   └── activityLogger.ts        ← [TO BUILD] shared logActivity() helper
│       └── types/
│           └── index.ts                 ← AuthenticatedRequest + shared types
│
└── frontend/                            ← NEXT.JS APP ROUTER CLIENT
    ├── .env                             ← Active env (NOT in git)
    ├── .env.example                     ← ⭐ Env template (copy this → .env)
    ├── package.json
    ├── next.config.ts
    ├── AGENTS.md                        ← Frontend AI agent rules (Sonner toast config)
    │
    ├── .ai/                             ← FRONTEND AI CONTEXT FILES
    │   ├── guide.md                     ← ⭐ Frontend dev guide (all 11 screens, components)
    │   └── connection_guide.md          ← API connection setup guide
    │
    ├── app/
    │   ├── layout.tsx                   ← Root layout (fonts, providers, Sonner toaster)
    │   ├── globals.css                  ← Global styles
    │   ├── page.tsx                     ← Landing/redirect page
    │   ├── login/page.tsx               ← Login screen ✅ exists
    │   ├── register/page.tsx            ← Register screen ✅ exists (needs role field update)
    │   └── (dashboard)/                 ← [TO BUILD] protected route group
    │       ├── layout.tsx               ← Sidebar + Topbar shared layout
    │       ├── dashboard/page.tsx        ← Screen 3: Dashboard
    │       ├── vendors/                 ← Screen 4: Vendor Management
    │       ├── rfqs/                    ← Screen 5: RFQ Creation + list
    │       ├── quotations/              ← Screen 6: Quotation submission
    │       ├── approvals/               ← Screen 8: Approval workflow
    │       ├── purchase-orders/         ← Screen 9a: PO management
    │       ├── invoices/                ← Screen 9b: Invoice + PDF/email
    │       ├── activity-logs/           ← Screen 10: Audit logs
    │       └── reports/                 ← Screen 11: Analytics
    │
    ├── components/                      ← [TO BUILD] shared UI components
    │   ├── Sidebar.tsx
    │   ├── Topbar.tsx
    │   ├── DataTable.tsx
    │   ├── StatusBadge.tsx
    │   ├── LoadingSkeleton.tsx
    │   ├── ConfirmDialog.tsx
    │   └── PageHeader.tsx
    │
    ├── services/                        ← API call layer (one file per module)
    │   └── auth.ts                      ← Auth service ✅ exists
    │
    ├── context/                         ← React context providers
    └── validations/                     ← Zod schemas for frontend forms
```

---

## 🔑 Key Files — Read These When Starting Any Task

| Priority | File | Why Read It |
|----------|------|------------|
| 1️⃣ | [`docs/context.md`](docs/context.md) | Full project overview: all screens, tables, workflow, roles, design tokens |
| 2️⃣ | [`backend/ai/Context.md`](backend/ai/Context.md) | All 13 DB tables, state machines, PO numbering, tax calc, approval logic |
| 2️⃣ | [`frontend/.ai/guide.md`](frontend/.ai/guide.md) | All 11 screens, shared components, services pattern, role-based UI |
| 3️⃣ | [`backend/ai/guide.md`](backend/ai/guide.md) | Backend dev standards, middleware patterns, Resend email, activity logging |
| 4️⃣ | [`docs/PRD.md`](docs/PRD.md) | Detailed screen specs, API list, DB schema spec, evaluation criteria |
| 5️⃣ | [`ai/Design.md`](ai/Design.md) | Odoo Purple theme tokens, typography, component aesthetics |

---

## ⚡ Quick Start Commands

```bash
# ── Backend ──────────────────────────────
cd backend
cp .env.example .env          # Setup env vars
npm install
npx prisma generate           # Generate Prisma types
npx prisma db push            # Sync schema to Neon DB
npx prisma db seed            # Populate demo data
npm run dev                   # Start on http://localhost:5001

# ── Frontend ─────────────────────────────
cd frontend
cp .env.example .env          # Setup env vars
npm install
npm run dev                   # Start on http://localhost:3000

# ── Prisma Utilities ─────────────────────
cd backend
npx prisma studio             # Visual DB editor in browser
npx prisma migrate dev --name <name>  # Create versioned migration
```

---

## 🔐 Demo Login Accounts (after seeding)

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| admin@example.com | admin123 | Admin | Full system access |
| manager1@example.com | manager123 | Manager | **L1 Approver** (auto-assigned) |
| manager2@example.com | manager456 | Manager | **L2 Approver** (auto-assigned) |
| officer@example.com | officer123 | Officer | Creates RFQs, generates POs |
| vendor1@example.com | vendor123 | Vendor | Submits quotations |
| vendor2@example.com | vendor456 | Vendor | Submits quotations |
| vendor3@example.com | vendor789 | Vendor | Submits quotations |

---

## 🏗️ Architecture Overview

```
[Browser]
    │ HTTPS
    ▼
[Next.js Frontend :3000]
    │ fetch/axios to /api/v1/*
    ▼
[Express Backend :5001]
    │ requireAuth → requireRole → validate(Zod)
    │
    ├─► [Controllers] → extract params
    │       │
    │       ▼
    │   [Services] → business logic, state machines
    │       │
    │       ▼
    │   [Repositories] → Prisma queries
    │       │
    │       ▼
    │   [Neon PostgreSQL] ← 13 tables
    │
    └─► [Resend API] → invoice emails, approval notifications
```

---

## 📋 Build Phases Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | DB Schema (13 tables) | 🔲 TODO |
| Phase 2 | Backend API Modules (11 modules) | 🔲 TODO |
| Phase 3 | Frontend Layout (sidebar + topbar + 8 shared components) | 🔲 TODO |
| Phase 4 | All 11 Frontend Screens | 🔲 TODO |
| Phase 5 | PDF Generation + Resend Email + File Upload | 🔲 TODO |
| Phase 6 | Notifications Wiring | 🔲 TODO |
| Phase 7 | Rich Seed Data (full demo workflow) | 🔲 TODO |
| Phase 8 | Final Polish + Submission Checklist | 🔲 TODO |

**Already Done ✅**: Auth APIs (register/login/logout/refresh), JWT middleware, Zod validation, Global error handler, Response helpers, Prisma setup, Login/Register pages, Dashboard skeleton, Sonner toasts, `.env.example` files.

---

## 🎯 Key Design Decisions (Finalized)

| Decision | Choice | Reason |
|----------|--------|--------|
| L1/L2 Approvers | Auto-assign first 2 managers by DB `id ASC` | Matches mockup, no extra UI needed |
| Email Service | **Resend API** (`resend` npm package) | Developer already has API key |
| File Storage | Local disk (`/backend/uploads/`) | Sufficient for hackathon demo |
| DB Platform | Neon PostgreSQL (hosted) | Real PostgreSQL, free tier, no setup |
| Frontend styling | Tailwind CSS (NO Shadcn UI) | Custom ERP aesthetic control |
| Primary color | `#714B67` (Odoo Purple) | Odoo brand alignment |

---

## ⚠️ Critical Rules (Never Break These)

1. `activity_logs` table is **WRITE-ONLY** — no UPDATE or DELETE anywhere in codebase
2. **Never commit** `.env` files containing real passwords/keys
3. **No hardcoded data** in final submission — all from live DB
4. All routes must have `requireAuth` + `requireRole` middleware
5. Always use `sendSuccess()` / `sendError()` for API responses — never raw `res.json()`
6. Import Prisma ONLY via `import prisma from '../lib/prisma'`
7. In **Prisma 7**: `DATABASE_URL` goes in `prisma.config.ts` — NOT in `schema.prisma`
