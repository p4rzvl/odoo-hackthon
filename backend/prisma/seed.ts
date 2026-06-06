import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing!');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing tables to avoid conflicts (cascade rules will handle dependent tokens)
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      phone: '+15550100',
      country: 'Belgium',
      isActive: true
    }
  });

  // Seed Manager 1 (L1 Approver)
  const manager1PasswordHash = await bcrypt.hash('manager123', 10);
  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@example.com',
      passwordHash: manager1PasswordHash,
      firstName: 'Marc',
      lastName: 'Demo',
      role: Role.MANAGER,
      phone: '+15550101',
      country: 'Belgium',
      isActive: true
    }
  });

  // Seed Manager 2 (L2 Approver)
  const manager2PasswordHash = await bcrypt.hash('manager456', 10);
  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@example.com',
      passwordHash: manager2PasswordHash,
      firstName: 'Mitchel',
      lastName: 'Admin',
      role: Role.MANAGER,
      phone: '+15550102',
      country: 'Belgium',
      isActive: true
    }
  });

  // Seed Officer user
  const officerPasswordHash = await bcrypt.hash('officer123', 10);
  const officer = await prisma.user.create({
    data: {
      email: 'officer@example.com',
      passwordHash: officerPasswordHash,
      firstName: 'Colleen',
      lastName: 'Officer',
      role: Role.OFFICER,
      phone: '+15550103',
      country: 'Belgium',
      isActive: true
    }
  });

  // Seed Vendors
  const vendor1PasswordHash = await bcrypt.hash('vendor123', 10);
  const vendor1 = await prisma.user.create({
    data: {
      email: 'vendor1@example.com',
      passwordHash: vendor1PasswordHash,
      firstName: 'Vendor',
      lastName: 'One',
      role: Role.VENDOR,
      phone: '+15550104',
      country: 'India',
      isActive: true
    }
  });

  const vendor2PasswordHash = await bcrypt.hash('vendor456', 10);
  const vendor2 = await prisma.user.create({
    data: {
      email: 'vendor2@example.com',
      passwordHash: vendor2PasswordHash,
      firstName: 'Vendor',
      lastName: 'Two',
      role: Role.VENDOR,
      phone: '+15550105',
      country: 'United States',
      isActive: true
    }
  });

  const vendor3PasswordHash = await bcrypt.hash('vendor789', 10);
  const vendor3 = await prisma.user.create({
    data: {
      email: 'vendor3@example.com',
      passwordHash: vendor3PasswordHash,
      firstName: 'Vendor',
      lastName: 'Three',
      role: Role.VENDOR,
      phone: '+15550106',
      country: 'Germany',
      isActive: true
    }
  });

  console.log('✅ Seeding completed successfully!');
  console.log('Seeded Users:');
  console.log(`- Admin: ${admin.email} (password: admin123)`);
  console.log(`- Manager 1 (L1): ${manager1.email} (password: manager123)`);
  console.log(`- Manager 2 (L2): ${manager2.email} (password: manager456)`);
  console.log(`- Officer: ${officer.email} (password: officer123)`);
  console.log(`- Vendor 1: ${vendor1.email} (password: vendor123)`);
  console.log(`- Vendor 2: ${vendor2.email} (password: vendor456)`);
  console.log(`- Vendor 3: ${vendor3.email} (password: vendor789)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

