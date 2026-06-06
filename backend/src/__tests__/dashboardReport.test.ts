import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as dashboardService from '../services/dashboard.service';
import * as reportRepository from '../repositories/report.repository';
import * as reportService from '../services/report.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Dashboard & Report Modules', () => {
  describe('Dashboard Service', () => {
    test('getDashboardMetrics aggregates and counts metrics correctly', async () => {
      // Mock raw SQL query for pending user accounts
      prismaMock.$queryRaw.mockResolvedValue([{ count: 3n }]);
      
      prismaMock.user.count.mockResolvedValue(10);
      prismaMock.activityLog.count.mockResolvedValue(100);
      prismaMock.rfq.count.mockResolvedValue(5);
      prismaMock.vendor.count.mockResolvedValue(8);
      
      // Standard approvals count mock (called twice for pendingApprovals and pendingSignOff)
      prismaMock.approval.count.mockResolvedValue(2);

      // Aggregate mocks
      prismaMock.purchaseOrder.aggregate.mockResolvedValue({
        _sum: { totalAmount: 150000 }
      } as any);

      prismaMock.vendor.findUnique.mockResolvedValue({ id: 5 } as any);
      prismaMock.rfqVendor.count.mockResolvedValue(4);
      prismaMock.quotation.count.mockResolvedValue(6);
      
      prismaMock.invoice.aggregate.mockResolvedValue({
        _sum: { grandTotal: 25000 }
      } as any);

      const metrics = await dashboardService.getDashboardMetrics(1);

      expect(metrics.pendingAccounts).toBe(3);
      expect(metrics.activeUsers).toBe(10);
      expect(metrics.totalPoSpend).toBe(150000);
      expect(metrics.unpaidInvoices).toBe(25000);
      expect(metrics.invitedRfqs).toBe(4);
      expect(metrics.submittedBids).toBe(6);
      expect(prismaMock.vendor.findUnique).toHaveBeenCalledWith({ where: { userId: 1 } });
    });
  });

  describe('Report Repository & Service', () => {
    test('getOverview calculates spend and rates', async () => {
      prismaMock.purchaseOrder.aggregate.mockResolvedValue({
        _sum: { totalAmount: 200000 },
        _count: 4
      } as any);

      prismaMock.purchaseOrder.count.mockResolvedValue(2); // Fulfilled count

      prismaMock.invoice.aggregate.mockResolvedValue({
        _sum: { grandTotal: 50000 },
        _count: 10
      } as any);

      prismaMock.invoice.count.mockResolvedValue(5); // Paid invoice count, overdue invoices
      prismaMock.vendor.count.mockResolvedValue(5);
      prismaMock.rfq.count.mockResolvedValue(8);
      prismaMock.quotation.count.mockResolvedValue(12);
      prismaMock.approval.count.mockResolvedValue(4);

      const overview = await reportRepository.getOverview();

      expect(overview.totalSpend).toBe(200000);
      expect(overview.totalPoCount).toBe(4);
      expect(overview.fulfillmentRate).toBe(50); // 2 out of 4 = 50%
      expect(overview.avgPoValue).toBe(50000); // 200000 / 4 = 50000
    });

    test('getOverview filters data for VENDOR role', async () => {
      const mockRawData = {
        totalSpend: 200000,
        totalPoCount: 4,
        avgPoValue: 50000,
        fulfillmentRate: 50
      };

      jest.spyOn(reportRepository, 'getOverview').mockResolvedValue(mockRawData as any);

      const vendorOverview = await reportService.getOverview('VENDOR');

      expect(vendorOverview.totalSpend).toBe(0);
      expect(vendorOverview.totalPoCount).toBe(0);
      expect(vendorOverview.avgPoValue).toBe(0);
    });
  });
});
