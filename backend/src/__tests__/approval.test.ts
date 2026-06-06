import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as approvalRepository from '../repositories/approval.repository';
import * as approvalService from '../services/approval.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Approval Module', () => {
  describe('Repository', () => {
    test('getNextPoNumber calculates correct sequence', async () => {
      const currentYear = new Date().getFullYear();
      prismaMock.purchaseOrder.findFirst.mockResolvedValue({
        poNumber: `PO-${currentYear}-000100`
      } as any);

      const nextNo = await approvalRepository.getNextPoNumber();
      expect(nextNo).toBe(`PO-${currentYear}-000101`);
    });

    test('getNextPoNumber handles first PO of the year', async () => {
      const currentYear = new Date().getFullYear();
      prismaMock.purchaseOrder.findFirst.mockResolvedValue(null);

      const nextNo = await approvalRepository.getNextPoNumber();
      expect(nextNo).toBe(`PO-${currentYear}-000001`);
    });
  });

  describe('Service', () => {
    test('approveApproval L1 updates L1/L2 status and alerts manager', async () => {
      // Mock approval detail for Level 1
      const mockApproval = {
        id: 10,
        approverId: 3,
        level: 1,
        status: 'PENDING',
        quotationId: 100,
        quotation: {
          id: 100,
          grandTotal: { toNumber: () => 50000, toString: () => '50000' },
          vendorId: 5,
          vendor: { companyName: 'Vendor A' },
          rfq: { id: 1, title: 'RFQ Title' }
        }
      } as any;

      prismaMock.approval.findUnique.mockResolvedValue(mockApproval);
      prismaMock.approval.findFirst.mockResolvedValue({
        id: 11,
        approverId: 4
      } as any);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 4,
        email: 'l2@example.com',
        firstName: 'L2',
        lastName: 'Manager'
      } as any);

      const result = await approvalService.approveApproval(3, 10, 'Approved L1');

      expect(result.success).toBe(true);
      expect(result.message).toContain('L1 approval');
      expect(prismaMock.approval.update).toHaveBeenCalled();
      expect(prismaMock.approval.updateMany).toHaveBeenCalled();
    });

    test('approveApproval L2 generates PO and closes RFQ', async () => {
      const mockApproval = {
        id: 20,
        approverId: 4,
        level: 2,
        status: 'PENDING',
        quotationId: 100,
        quotation: {
          id: 100,
          grandTotal: { toNumber: () => 50000, toString: () => '50000' },
          vendorId: 5,
          vendor: { companyName: 'Vendor A', user: { id: 9, email: 'v@example.com' } },
          rfq: { id: 1, title: 'RFQ Title', creator: null, createdBy: 2 }
        }
      } as any;

      prismaMock.approval.findUnique.mockResolvedValue(mockApproval);
      prismaMock.purchaseOrder.findFirst.mockResolvedValue(null);
      prismaMock.purchaseOrder.create.mockResolvedValue({
        id: 50,
        poNumber: 'PO-2026-000001'
      } as any);

      const result = await approvalService.approveApproval(4, 20, 'Approved L2');

      expect(result.success).toBe(true);
      expect(result.message).toContain('L2 approval');
      expect(prismaMock.purchaseOrder.create).toHaveBeenCalled();
      expect(prismaMock.rfq.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CLOSED' }
      });
    });

    test('rejectApproval resets quotation to SUBMITTED status', async () => {
      const mockApproval = {
        id: 10,
        approverId: 3,
        level: 1,
        status: 'PENDING',
        quotationId: 100,
        quotation: {
          id: 100,
          vendor: { companyName: 'Vendor A' },
          rfq: { id: 1, title: 'RFQ Title' }
        }
      } as any;

      prismaMock.approval.findUnique.mockResolvedValue(mockApproval);

      const result = await approvalService.rejectApproval(3, 10, 'Rejected reason');

      expect(result.success).toBe(true);
      expect(prismaMock.quotation.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { status: 'SUBMITTED' }
      });
    });
  });
});
