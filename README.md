# Odoo Hackathon Project Template

This repository contains the basic structure for an Odoo-inspired hackathon project using Next.js (frontend) and Express + Prisma (backend).

## Project Structure

```
.
├── docs/               # Architecture, database schemas, and API documentation
├── frontend/           # Next.js App Router application (Odoo Purple theme)
├── backend/            # Express.js TypeScript API server
└── README.md
```

---

## Setup & Running

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (e.g. Neon)

### 1. Backend Setup & Run
1. Change into the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy the example environment template to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `backend/.env` and configure your database and authentication values:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_7Mfut8DBRcns@ep-raspy-feather-aooedl2p.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   PORT=5001
   FRONTEND_URL="http://localhost:3000"
   JWT_SECRET="super-secret-key-for-development"
   REFRESH_SECRET="super-secret-refresh-key-for-development"
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

The backend server runs on `http://localhost:5001`.

### 2. Frontend Setup & Run
1. Change into the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Copy the example environment template to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `frontend/.env` and configure the API endpoint URL:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5001/api"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

The frontend application runs on `http://localhost:3000`.


---

## Prisma Database Commands

Run these database commands inside the `backend/` directory:

### Sync Schema (Db Push)
Synchronize the local [schema.prisma](file:///Users/dhairyadarji/Developer/odoo%20hackthon/backend/prisma/schema.prisma) with the live Neon PostgreSQL database directly:
```bash
npx prisma db push
```

### Seeding Test Data (Default Logins)
Run the seed script to wipe the database and pre-populate with test user accounts:
```bash
npx prisma db seed
```
**Default Seed Accounts**:
- **Admin**: `admin@example.com` (password: `admin123`)
- **Demo**: `demo@example.com` (password: `demo123`)

### Create Migrations
Generate SQL files to version control database schema adjustments:
```bash
npx prisma migrate dev --name <migration_name>
```

### Rebuild Client Types
Rebuild the local types client after altering the Prisma schema models:
```bash
npx prisma generate
```

### Database Visualizer (Studio)
Open Prisma Studio visual spreadsheet to inspect and modify database records in the browser:
```bash
npx prisma studio
```
