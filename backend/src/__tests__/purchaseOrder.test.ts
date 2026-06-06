import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as poRepository from '../repositories/purchaseOrder.repository';
import * as poService from '../services/purchaseOrder.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Purchase Order Module', () => {
  describe('Repository', () => {
    test('listPurchaseOrders calls findMany and count', async () => {
      prismaMock.purchaseOrder.findMany.mockResolvedValue([]);
      prismaMock.purchaseOrder.count.mockResolvedValue(0);

      const result = await poRepository.listPurchaseOrders({ page: 1, limit: 10 });
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalled();
    });

    test('getPurchaseOrderById returns correct structure', async () => {
      const mockPo = { id: 1, poNumber: 'PO-2026-000001' } as any;
      prismaMock.purchaseOrder.findUnique.mockResolvedValue(mockPo);

      const result = await poRepository.getPurchaseOrderById(1);
      expect(result).toEqual(mockPo);
      expect(prismaMock.purchaseOrder.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
    });
  });

  describe('Service', () => {
    test('listPurchaseOrders resolves Vendor ID if role is VENDOR', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({ id: 5 } as any);
      prismaMock.purchaseOrder.findMany.mockResolvedValue([]);
      prismaMock.purchaseOrder.count.mockResolvedValue(0);

      const result = await poService.listPurchaseOrders(
        { id: 2, role: 'VENDOR' },
        { page: '1', limit: '10' }
      );

      expect(result.items).toEqual([]);
      expect(prismaMock.vendor.findUnique).toHaveBeenCalledWith({
        where: { userId: 2 }
      });
    });

    test('getPurchaseOrderDetail throws error if not found', async () => {
      prismaMock.purchaseOrder.findUnique.mockResolvedValue(null);

      await expect(poService.getPurchaseOrderDetail(999, { id: 1, role: 'OFFICER' })).rejects.toThrow(
        'Purchase Order not found'
      );
    });

    test('getPurchaseOrderDetail throws if vendor attempts to view other vendor PO', async () => {
      prismaMock.purchaseOrder.findUnique.mockResolvedValue({
        id: 1,
        vendorId: 5
      } as any);
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 6 // Different vendor ID
      } as any);

      await expect(poService.getPurchaseOrderDetail(1, { id: 2, role: 'VENDOR' })).rejects.toThrow(
        'Access denied: You are not authorized to view this Purchase Order'
      );
    });
  });
});
