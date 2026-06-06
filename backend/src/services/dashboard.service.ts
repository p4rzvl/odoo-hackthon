import prisma from '../lib/prisma';

export const getDashboardMetrics = async (userId: number) => {
  const pendingAccounts = await prisma.user.count({
    where: { isActive: false, role: { not: 'ADMIN' } }
  });

  const activeUsers = await prisma.user.count({
    where: { isActive: true }
  });

  const totalActivityLogs = await prisma.activityLog.count();

  const activeRfqs = await prisma.rfq.count({
    where: { status: 'PUBLISHED' }
  });

  const registeredVendors = await prisma.vendor.count({
    where: { status: 'ACTIVE' }
  });

  const pendingApprovals = await prisma.approval.count({
    where: { status: 'PENDING' }
  });

  const poAgg = await prisma.purchaseOrder.aggregate({
    _sum: { totalAmount: true },
    where: { status: { not: 'DRAFT' } }
  });
  const totalPoSpend = poAgg._sum.totalAmount ?? 0;

  const pendingSignOff = await prisma.approval.count({
    where: { approverId: userId, status: 'PENDING' }
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const approvedToday = await prisma.approval.count({
    where: {
      approverId: userId,
      status: 'APPROVED',
      actionedAt: { gte: todayStart, lte: todayEnd }
    }
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const mpoAgg = await prisma.purchaseOrder.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: { not: 'DRAFT' },
      createdAt: { gte: monthStart }
    }
  });
  const monthlySpendAuthorized = mpoAgg._sum.totalAmount ?? 0;

  const vendor = await prisma.vendor.findUnique({ where: { userId } });

  let invitedRfqs = 0;
  let submittedBids = 0;
  let unpaidInvoices = 0;

  if (vendor) {
    invitedRfqs = await prisma.rfqVendor.count({
      where: { vendorId: vendor.id }
    });

    submittedBids = await prisma.quotation.count({
      where: { vendorId: vendor.id, status: { not: 'DRAFT' } }
    });

    const invAgg = await prisma.invoice.aggregate({
      _sum: { grandTotal: true },
      where: {
        status: 'PENDING_PAYMENT',
        purchaseOrder: { vendorId: vendor.id }
      }
    });
    unpaidInvoices = Number(invAgg._sum.grandTotal ?? 0);
  }

  return {
    pendingAccounts,
    activeUsers,
    totalActivityLogs,
    activeRfqs,
    registeredVendors,
    pendingApprovals,
    totalPoSpend: Number(totalPoSpend),
    pendingSignOff,
    approvedToday,
    monthlySpendAuthorized: Number(monthlySpendAuthorized),
    invitedRfqs,
    submittedBids,
    unpaidInvoices: Number(unpaidInvoices)
  };
};
