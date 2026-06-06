import {
  ApprovalStatus,
  InvoiceStatus,
  PoStatus,
  PrismaClient,
  QuotationStatus,
  RfqStatus,
  Role,
  VendorStatus,
} from '@prisma/client';
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

  // Wipe all data in dependency order
  await prisma.refreshToken.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "ActivityLog" CASCADE');
  await prisma.invoice.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.rfqAttachment.deleteMany({});
  await prisma.rfqVendor.deleteMany({});
  await prisma.rfqLineItem.deleteMany({});
  await prisma.rfq.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.user.deleteMany({});

  // ──────────────────────────────────────────
  // 1. USERS
  // ──────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      firstName: 'System', lastName: 'Administrator',
      role: Role.ADMIN, phone: '+15550100', country: 'Belgium', isActive: true
    }
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@example.com',
      passwordHash: await bcrypt.hash('manager123', 10),
      firstName: 'Marc', lastName: 'Demo',
      role: Role.MANAGER, phone: '+15550101', country: 'Belgium',
      isActive: true, approvalLevel: 1
    }
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@example.com',
      passwordHash: await bcrypt.hash('manager456', 10),
      firstName: 'Mitchel', lastName: 'Admin',
      role: Role.MANAGER, phone: '+15550102', country: 'Belgium',
      isActive: true, approvalLevel: 2
    }
  });

  const officer = await prisma.user.create({
    data: {
      email: 'officer@example.com',
      passwordHash: await bcrypt.hash('officer123', 10),
      firstName: 'Colleen', lastName: 'Officer',
      role: Role.OFFICER, phone: '+15550103', country: 'Belgium', isActive: true
    }
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      email: 'vendor1@example.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      firstName: 'Ravi', lastName: 'Sharma',
      role: Role.VENDOR, phone: '+91999990001', country: 'India', isActive: true
    }
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      email: 'vendor2@example.com',
      passwordHash: await bcrypt.hash('vendor456', 10),
      firstName: 'John', lastName: 'Smith',
      role: Role.VENDOR, phone: '+14155550001', country: 'United States', isActive: true
    }
  });

  const vendorUser3 = await prisma.user.create({
    data: {
      email: 'vendor3@example.com',
      passwordHash: await bcrypt.hash('vendor789', 10),
      firstName: 'Hans', lastName: 'Mueller',
      role: Role.VENDOR, phone: '+49305550001', country: 'Germany', isActive: true
    }
  });

  // ──────────────────────────────────────────
  // 2. VENDOR PROFILES
  // ──────────────────────────────────────────

  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      companyName: 'TechMart India Pvt Ltd',
      gstNumber: 'GSTIN-27AABCU1234D1Z5',
      category: 'IT Hardware',
      contactNumber: '+91999990001',
      address: '91 MG Road, Bengaluru, Karnataka 560001, India',
      status: VendorStatus.ACTIVE
    }
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      companyName: 'Global Office Supplies Inc.',
      gstNumber: 'GSTIN-US36DEFG5678H2Z9',
      category: 'Office Supplies',
      contactNumber: '+14155550001',
      address: '200 Park Avenue, New York, NY 10001, USA',
      status: VendorStatus.ACTIVE
    }
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendorUser3.id,
      companyName: 'IndustrieBedarf GmbH',
      gstNumber: 'GSTIN-DE12HIJK9012L3Z7',
      category: 'Industrial Equipment',
      contactNumber: '+49305550001',
      address: 'Industriestrasse 50, 10115 Berlin, Germany',
      status: VendorStatus.ACTIVE
    }
  });

  // ──────────────────────────────────────────
  // 3. RFQ 1 — Office Laptops & Peripherals
  // ──────────────────────────────────────────

  const rfq1 = await prisma.rfq.create({
    data: {
      title: 'Office Laptops & Peripherals',
      category: 'IT Hardware',
      description: 'We require 50 high-performance laptops, 30 external monitors, and 100 wireless keyboard-mouse combos for our new office expansion. All equipment must come with 3-year warranty and on-site support.',
      deadline: new Date('2026-07-15'),
      status: RfqStatus.PUBLISHED,
      createdBy: officer.id
    }
  });

  const rfq1Items = await Promise.all([
    prisma.rfqLineItem.create({
      data: { rfqId: rfq1.id, itemName: 'Dell Latitude 5540 Laptop (16GB RAM, 512GB SSD)', quantity: 50, unit: 'Units' }
    }),
    prisma.rfqLineItem.create({
      data: { rfqId: rfq1.id, itemName: 'Dell 27" 4K USB-C Monitor', quantity: 30, unit: 'Units' }
    }),
    prisma.rfqLineItem.create({
      data: { rfqId: rfq1.id, itemName: 'Logitech MK270 Wireless Combo', quantity: 100, unit: 'Units' }
    }),
  ]);

  // Assign vendor1 & vendor2 to RFQ 1
  await Promise.all([
    prisma.rfqVendor.create({ data: { rfqId: rfq1.id, vendorId: vendor1.id } }),
    prisma.rfqVendor.create({ data: { rfqId: rfq1.id, vendorId: vendor2.id } }),
  ]);

  // ──────────────────────────────────────────
  // 4. RFQ 2 — Annual Office Stationery Supply
  // ──────────────────────────────────────────

  const rfq2 = await prisma.rfq.create({
    data: {
      title: 'Annual Office Stationery Supply',
      category: 'Office Supplies',
      description: 'Annual contract for office stationery including A4 paper, printer toner, and employee stationery kits. Quarterly delivery. Contract period: 12 months.',
      deadline: new Date('2026-06-30'),
      status: RfqStatus.PUBLISHED,
      createdBy: officer.id
    }
  });

  const rfq2Items = await Promise.all([
    prisma.rfqLineItem.create({
      data: { rfqId: rfq2.id, itemName: 'A4 Premium Copy Paper (5000-sheet carton)', quantity: 500, unit: 'Cartons' }
    }),
    prisma.rfqLineItem.create({
      data: { rfqId: rfq2.id, itemName: 'HP LaserJet Toner Cartridge (CF226X)', quantity: 20, unit: 'Units' }
    }),
    prisma.rfqLineItem.create({
      data: { rfqId: rfq2.id, itemName: 'Employee Welcome Stationery Kit', quantity: 200, unit: 'Kits' }
    }),
  ]);

  // Assign vendor2 & vendor3 to RFQ 2
  await Promise.all([
    prisma.rfqVendor.create({ data: { rfqId: rfq2.id, vendorId: vendor2.id } }),
    prisma.rfqVendor.create({ data: { rfqId: rfq2.id, vendorId: vendor3.id } }),
  ]);

  // ──────────────────────────────────────────
  // 5. QUOTATIONS for RFQ 1
  // ──────────────────────────────────────────

  // Vendor 1 — Quotation for RFQ 1 (cheaper)
  const q1Items = [
    { rfqLineItemId: rfq1Items[0].id, unitPrice: 72000, totalPrice: 3600000, deliveryDays: 14 },
    { rfqLineItemId: rfq1Items[1].id, unitPrice: 18500, totalPrice: 555000,  deliveryDays: 10 },
    { rfqLineItemId: rfq1Items[2].id, unitPrice: 1250,  totalPrice: 125000,  deliveryDays: 7 },
  ];
  const q1Subtotal = q1Items.reduce((s, i) => s + i.totalPrice, 0); // 4,280,000
  const q1Tax = Math.round(q1Subtotal * 0.18 * 100) / 100;          // 770,400
  const q1Grand = Math.round((q1Subtotal + q1Tax) * 100) / 100;     // 5,050,400

  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id, vendorId: vendor1.id,
      gstPercent: 18, subtotal: q1Subtotal, taxAmount: q1Tax, grandTotal: q1Grand,
      status: QuotationStatus.SUBMITTED,
      items: { create: q1Items }
    }
  });

  // Vendor 2 — Quotation for RFQ 1 (expensive)
  const q2Items = [
    { rfqLineItemId: rfq1Items[0].id, unitPrice: 89900, totalPrice: 4495000, deliveryDays: 21 },
    { rfqLineItemId: rfq1Items[1].id, unitPrice: 22500, totalPrice: 675000,  deliveryDays: 14 },
    { rfqLineItemId: rfq1Items[2].id, unitPrice: 1800,  totalPrice: 180000,  deliveryDays: 10 },
  ];
  const q2Subtotal = q2Items.reduce((s, i) => s + i.totalPrice, 0); // 5,350,000
  const q2Tax = Math.round(q2Subtotal * 0.18 * 100) / 100;          // 963,000
  const q2Grand = Math.round((q2Subtotal + q2Tax) * 100) / 100;     // 6,313,000

  const q2Record = await prisma.quotation.create({
    data: {
      rfqId: rfq1.id, vendorId: vendor2.id,
      gstPercent: 18, subtotal: q2Subtotal, taxAmount: q2Tax, grandTotal: q2Grand,
      status: QuotationStatus.SUBMITTED,
      items: { create: q2Items }
    }
  });

  // ──────────────────────────────────────────
  // 6. QUOTATIONS for RFQ 2
  // ──────────────────────────────────────────

  // Vendor 2 — Quotation for RFQ 2
  const q3Items = [
    { rfqLineItemId: rfq2Items[0].id, unitPrice: 2200,  totalPrice: 1100000, deliveryDays: 5 },
    { rfqLineItemId: rfq2Items[1].id, unitPrice: 8500,  totalPrice: 170000,  deliveryDays: 3 },
    { rfqLineItemId: rfq2Items[2].id, unitPrice: 350,   totalPrice: 70000,   deliveryDays: 7 },
  ];
  const q3Subtotal = q3Items.reduce((s, i) => s + i.totalPrice, 0); // 1,340,000
  const q3Tax = Math.round(q3Subtotal * 0.18 * 100) / 100;          // 241,200
  const q3Grand = Math.round((q3Subtotal + q3Tax) * 100) / 100;     // 1,581,200

  const q3Record = await prisma.quotation.create({
    data: {
      rfqId: rfq2.id, vendorId: vendor2.id,
      gstPercent: 18, subtotal: q3Subtotal, taxAmount: q3Tax, grandTotal: q3Grand,
      status: QuotationStatus.SUBMITTED,
      items: { create: q3Items }
    }
  });

  // Vendor 3 — Quotation for RFQ 2
  const q4Items = [
    { rfqLineItemId: rfq2Items[0].id, unitPrice: 1950,  totalPrice: 975000,  deliveryDays: 10 },
    { rfqLineItemId: rfq2Items[1].id, unitPrice: 9200,  totalPrice: 184000,  deliveryDays: 7 },
    { rfqLineItemId: rfq2Items[2].id, unitPrice: 280,   totalPrice: 56000,   deliveryDays: 10 },
  ];
  const q4Subtotal = q4Items.reduce((s, i) => s + i.totalPrice, 0); // 1,215,000
  const q4Tax = Math.round(q4Subtotal * 0.18 * 100) / 100;          // 218,700
  const q4Grand = Math.round((q4Subtotal + q4Tax) * 100) / 100;     // 1,433,700

  const q4Record = await prisma.quotation.create({
    data: {
      rfqId: rfq2.id, vendorId: vendor3.id,
      gstPercent: 18, subtotal: q4Subtotal, taxAmount: q4Tax, grandTotal: q4Grand,
      status: QuotationStatus.SUBMITTED,
      items: { create: q4Items }
    }
  });

  // ──────────────────────────────────────────
  // 7. APPROVALS, PO, INVOICE, LOGS, NOTIFICATIONS
  //    Demo chain for RFQ 1 -> Vendor 1 quotation
  // ──────────────────────────────────────────

  const selectedQuotation = await prisma.quotation.findFirst({
    where: { rfqId: rfq1.id, vendorId: vendor1.id },
    include: { items: true }
  });

  if (!selectedQuotation) {
    throw new Error('Expected demo quotation was not created.');
  }

  const approval1 = await prisma.approval.create({
    data: {
      quotationId: selectedQuotation.id,
      approverId: manager1.id,
      level: 1,
      status: ApprovalStatus.APPROVED,
      remarks: 'Approved for L1 review based on budget fit and delivery timeline.',
      assignedAt: new Date('2026-06-01T09:30:00.000Z'),
      actionedAt: new Date('2026-06-01T10:15:00.000Z'),
    },
  });

  const approval2 = await prisma.approval.create({
    data: {
      quotationId: selectedQuotation.id,
      approverId: manager2.id,
      level: 2,
      status: ApprovalStatus.APPROVED,
      remarks: 'Final approval granted for PO generation.',
      assignedAt: new Date('2026-06-01T10:20:00.000Z'),
      actionedAt: new Date('2026-06-01T11:00:00.000Z'),
    },
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-0001',
      quotationId: selectedQuotation.id,
      vendorId: vendor1.id,
      totalAmount: selectedQuotation.grandTotal,
      status: PoStatus.APPROVED,
      createdAt: new Date('2026-06-01T11:10:00.000Z'),
      updatedAt: new Date('2026-06-01T11:10:00.000Z'),
    },
  });

  // ── Historical POs for reports trend (Jan–May 2026) ──

  const poBase = [
    { month: 0, day: 10, vendorId: vendor1.id, quotId: selectedQuotation.id, amount: 1800000, fn: 'PO-2026-0002', inv: 'INV-2026-0002', st: 1525424, paid: true },
    { month: 1, day: 15, vendorId: vendor2.id, quotId: q2Record.id,         amount: 2200000, fn: 'PO-2026-0003', inv: 'INV-2026-0003', st: 1864407, paid: true },
    { month: 2, day: 8,  vendorId: vendor1.id, quotId: selectedQuotation.id, amount: 950000,  fn: 'PO-2026-0004', inv: 'INV-2026-0004', st: 805085,  paid: false },
    { month: 2, day: 22, vendorId: vendor3.id, quotId: q4Record.id,         amount: 1450000, fn: 'PO-2026-0005', inv: 'INV-2026-0005', st: 1228814, paid: true },
    { month: 3, day: 5,  vendorId: vendor2.id, quotId: q3Record.id,         amount: 3100000, fn: 'PO-2026-0006', inv: 'INV-2026-0006', st: 2627119, paid: false },
    { month: 4, day: 12, vendorId: vendor1.id, quotId: selectedQuotation.id, amount: 2700000, fn: 'PO-2026-0007', inv: 'INV-2026-0007', st: 2288136, paid: false },
  ];

  for (const p of poBase) {
    const poDate = new Date(2026, p.month, p.day, 10, 0, 0);
    const invDate = new Date(2026, p.month, p.day + 1, 0, 0, 0);
    const dueDate = new Date(2026, p.month + 1, p.day, 0, 0, 0);
    const cgst = Math.round(p.st * 0.09 * 100) / 100;
    const sgst = Math.round(p.st * 0.09 * 100) / 100;
    const grand = Math.round((p.st + cgst + sgst) * 100) / 100;

    const histPo = await prisma.purchaseOrder.create({
      data: {
        poNumber: p.fn,
        quotationId: p.quotId,
        vendorId: p.vendorId,
        totalAmount: p.amount,
        status: p.paid ? PoStatus.FULFILLED : PoStatus.APPROVED,
        createdAt: poDate,
        updatedAt: poDate,
      },
    });

    await prisma.invoice.create({
      data: {
        invoiceNumber: p.inv,
        poId: histPo.id,
        invoiceDate: invDate,
        dueDate,
        subtotal: p.st,
        cgst,
        sgst,
        grandTotal: grand,
        status: p.paid ? InvoiceStatus.PAID : InvoiceStatus.PENDING_PAYMENT,
        paidAt: p.paid ? invDate : null,
        paidRemarks: p.paid ? 'Bank transfer processed' : null,
      },
    });

    await prisma.activityLog.createMany({
      data: [
        {
          actorId: officer.id,
          actionType: 'PO',
          description: `Purchase order ${p.fn} created for vendor.`,
          entityId: histPo.id,
          entityType: 'purchase_order',
          createdAt: poDate,
        },
        {
          actorId: officer.id,
          actionType: 'INVOICE',
          description: `Invoice ${p.inv} generated from ${p.fn}.`,
          entityId: histPo.id,
          entityType: 'invoice',
          createdAt: invDate,
        },
      ]
    });
  }

  const invoiceSubtotal = Number(selectedQuotation.subtotal);
  const invoiceCgst = Math.round(invoiceSubtotal * 0.09 * 100) / 100;
  const invoiceSgst = Math.round(invoiceSubtotal * 0.09 * 100) / 100;
  const invoiceGrand = Math.round((invoiceSubtotal + invoiceCgst + invoiceSgst) * 100) / 100;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      poId: po.id,
      invoiceDate: new Date('2026-06-02T00:00:00.000Z'),
      dueDate: new Date('2026-07-02T00:00:00.000Z'),
      subtotal: invoiceSubtotal,
      cgst: invoiceCgst,
      sgst: invoiceSgst,
      grandTotal: invoiceGrand,
      status: InvoiceStatus.PENDING_PAYMENT,
      pdfPath: '/uploads/invoices/INV-2026-0001.pdf',
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: vendorUser1.id,
        message: `Quotation selected for "${rfq1.title}" and moved to approval.`,
        type: 'QUOTATION_SELECTED',
        isRead: false,
        relatedEntityId: selectedQuotation.id,
        entityType: 'quotation',
      },
      {
        userId: manager1.id,
        message: `L1 approval assigned for quotation ${selectedQuotation.id}.`,
        type: 'APPROVAL_ASSIGNED',
        isRead: false,
        relatedEntityId: approval1.id,
        entityType: 'approval',
      },
      {
        userId: manager2.id,
        message: `L2 approval assigned for quotation ${selectedQuotation.id}.`,
        type: 'APPROVAL_ASSIGNED',
        isRead: false,
        relatedEntityId: approval2.id,
        entityType: 'approval',
      },
      {
        userId: officer.id,
        message: `Purchase order ${po.poNumber} generated for ${vendor1.companyName}.`,
        type: 'PO_CREATED',
        isRead: false,
        relatedEntityId: po.id,
        entityType: 'purchase_order',
      },
      {
        userId: officer.id,
        message: `Invoice ${invoice.invoiceNumber} generated from ${po.poNumber}.`,
        type: 'INVOICE_CREATED',
        isRead: false,
        relatedEntityId: invoice.id,
        entityType: 'invoice',
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        actorId: officer.id,
        actionType: 'QUOTATION',
        description: `Selected quotation ${selectedQuotation.id} for "${rfq1.title}".`,
        entityId: selectedQuotation.id,
        entityType: 'quotation',
      },
      {
        actorId: manager1.id,
        actionType: 'APPROVAL',
        description: `L1 approved quotation ${selectedQuotation.id}.`,
        entityId: approval1.id,
        entityType: 'approval',
      },
      {
        actorId: manager2.id,
        actionType: 'APPROVAL',
        description: `L2 approved quotation ${selectedQuotation.id}.`,
        entityId: approval2.id,
        entityType: 'approval',
      },
      {
        actorId: officer.id,
        actionType: 'PO',
        description: `Purchase order ${po.poNumber} created for vendor ${vendor1.companyName}.`,
        entityId: po.id,
        entityType: 'purchase_order',
      },
      {
        actorId: officer.id,
        actionType: 'INVOICE',
        description: `Invoice ${invoice.invoiceNumber} generated for ${po.poNumber}.`,
        entityId: invoice.id,
        entityType: 'invoice',
      },
    ],
  });

  // ──────────────────────────────────────────
  // DONE
  // ──────────────────────────────────────────

  console.log('✅ Seeding completed successfully!');
  console.log('');
  console.log('📋 Seeded Data:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Users:');
  console.log(`  • ${admin.email}         (ADMIN)    — admin123`);
  console.log(`  • ${manager1.email}      (MANAGER)  — manager123  [L1]`);
  console.log(`  • ${manager2.email}      (MANAGER)  — manager456  [L2]`);
  console.log(`  • ${officer.email}       (OFFICER)  — officer123`);
  console.log(`  • ${vendorUser1.email}   (VENDOR)   — vendor123`);
  console.log(`  • ${vendorUser2.email}   (VENDOR)   — vendor456`);
  console.log(`  • ${vendorUser3.email}   (VENDOR)   — vendor789`);
  console.log('');
  console.log('🏢 Vendors:');
  console.log(`  • ${vendor1.companyName}  (IT Hardware, India)`);
  console.log(`  • ${vendor2.companyName}  (Office Supplies, USA)`);
  console.log(`  • ${vendor3.companyName}  (Industrial Equipment, Germany)`);
  console.log('');
  console.log('📄 RFQs Published:');
  console.log(`  • "${rfq1.title}" — ${rfq1Items.length} line items, 2 vendors assigned`);
  console.log(`  • "${rfq2.title}" — ${rfq2Items.length} line items, 2 vendors assigned`);
  console.log('');
  console.log('💸 Quotations Submitted:');
  console.log(`  • TechMart India → Laptops RFQ: ₹${q1Grand.toLocaleString()}`);
  console.log(`  • Global Office → Laptops RFQ: ₹${q2Grand.toLocaleString()}`);
  console.log(`  • Global Office → Stationery RFQ: ₹${q3Grand.toLocaleString()}`);
  console.log(`  • IndustrieBedarf → Stationery RFQ: ₹${q4Grand.toLocaleString()}`);
  console.log('');
  console.log('✅ Demo Workflow Seeded:');
  console.log(`  • Approvals: ${approval1.status} L1 + ${approval2.status} L2`);
  console.log(`  • PO: ${po.poNumber}`);
  console.log(`  • Invoice: ${invoice.invoiceNumber}`);
  console.log('');
  console.log('▶️  Next Steps:');
  console.log('  1. Login as officer → compare quotes & select winner');
  console.log('  2. Login as manager1 → L1 approve');
  console.log('  3. Login as manager2 → L2 approve → PO auto-generated');
  console.log('  4. Login as officer → view PO → generate invoice');
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
