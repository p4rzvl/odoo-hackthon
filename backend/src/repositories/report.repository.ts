import prisma from '../lib/prisma';

export const getOverview = async (month?: string) => {
  const dateFilter = month ? { lte: new Date(month + '-28T23:59:59Z') } : undefined;

  const poWhere: any = { status: { not: 'DRAFT' } };
  if (dateFilter) poWhere.createdAt = dateFilter;

  const poAgg = await prisma.purchaseOrder.aggregate({
    _sum: { totalAmount: true },
    _count: true,
    where: poWhere
  });

  const fulfilledCount = await prisma.purchaseOrder.count({
    where: { ...(dateFilter ? { createdAt: dateFilter } : {}), status: 'FULFILLED' }
  });

  const totalPoCount = poAgg._count;
  const fulfillmentRate = totalPoCount > 0 ? (fulfilledCount / totalPoCount) * 100 : 0;

  const invWhere: any = {};
  if (dateFilter) invWhere.createdAt = dateFilter;

  const invoiceAgg = await prisma.invoice.aggregate({
    _sum: { grandTotal: true },
    _count: true,
    where: invWhere
  });

  const paidInvoiceCount = await prisma.invoice.count({
    where: { ...invWhere, status: 'PAID' }
  });

  const totalInvoiceCount = invoiceAgg._count;
  const paidRate = totalInvoiceCount > 0 ? (paidInvoiceCount / totalInvoiceCount) * 100 : 0;

  const overdueInvoices = await prisma.invoice.count({
    where: { ...invWhere, status: 'OVERDUE' }
  });

  const activeVendors = await prisma.vendor.count({
    where: { status: 'ACTIVE' }
  });

  const rfqWhere: any = {};
  if (dateFilter) rfqWhere.createdAt = dateFilter;
  const rfqCount = await prisma.rfq.count({ where: rfqWhere });
  const quotationCount = await prisma.quotation.count({
    where: { status: { not: 'DRAFT' } }
  });
  const pendingApprovals = await prisma.approval.count({
    where: { status: 'PENDING' }
  });

  const avgPoValue = totalPoCount > 0 ? Number(poAgg._sum.totalAmount ?? 0) / totalPoCount : 0;

  return {
    totalSpend: Number(poAgg._sum.totalAmount ?? 0),
    totalPoCount,
    fulfilledCount,
    fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
    totalInvoiceValue: Number(invoiceAgg._sum.grandTotal ?? 0),
    totalInvoiceCount,
    paidInvoiceCount,
    paidRate: Math.round(paidRate * 100) / 100,
    overdueInvoices,
    activeVendors,
    rfqCount,
    quotationCount,
    pendingApprovals,
    avgPoValue: Math.round(avgPoValue * 100) / 100
  };
};

export const getSpendTrend = async (month?: string) => {
  const endDate = month ? new Date(month + '-28T23:59:59Z') : new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 5);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const pos = await prisma.purchaseOrder.findMany({
    where: {
      status: { not: 'DRAFT' },
      createdAt: { gte: startDate, lte: endDate }
    },
    select: { totalAmount: true, createdAt: true, status: true }
  });

  const monthly: Record<string, { total: number; count: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = { total: 0, count: 0 };
  }

  for (const po of pos) {
    const d = new Date(po.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthly[key]) {
      monthly[key].total += Number(po.totalAmount);
      monthly[key].count += 1;
    }
  }

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      spend: Math.round(data.total * 100) / 100,
      count: data.count
    }));
};

export const getSpendByVendor = async () => {
  const vendorSpend = await prisma.vendor.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      companyName: true,
      category: true,
      purchaseOrders: {
        where: { status: { not: 'DRAFT' } },
        select: { totalAmount: true }
      }
    }
  });

  return vendorSpend
    .map(v => ({
      id: v.id,
      companyName: v.companyName,
      category: v.category,
      totalSpend: Math.round(v.purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0) * 100) / 100,
      poCount: v.purchaseOrders.length
    }))
    .filter(v => v.poCount > 0)
    .sort((a, b) => b.totalSpend - a.totalSpend);
};

export const getCsvData = async () => {
  const pos = await prisma.purchaseOrder.findMany({
    where: { status: { not: 'DRAFT' } },
    include: {
      vendor: { select: { companyName: true, gstNumber: true, category: true } },
      quotation: {
        select: { rfq: { select: { title: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return pos.map(po => ({
    'PO Number': po.poNumber,
    'Vendor': po.vendor.companyName,
    'Category': po.vendor.category,
    'GST': po.vendor.gstNumber,
    'RFQ': po.quotation.rfq.title,
    'Total Amount': Number(po.totalAmount).toFixed(2),
    'Status': po.status,
    'Created': po.createdAt.toISOString().split('T')[0]
  }));
};
