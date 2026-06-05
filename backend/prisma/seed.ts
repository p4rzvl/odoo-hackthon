import { PrismaClient } from '@prisma/client';
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

  // Clean existing tables to avoid conflicts
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      name: 'System Administrator'
    }
  });

  // Seed Demo user
  const demoPasswordHash = await bcrypt.hash('demo123', 10);
  const demo = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      passwordHash: demoPasswordHash,
      name: 'Odoo Tester'
    }
  });

  console.log('✅ Seeding completed successfully!');
  console.log('Seeded Users:');
  console.log(`- Admin: ${admin.email} (password: admin123)`);
  console.log(`- Demo: ${demo.email} (password: demo123)`);
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
