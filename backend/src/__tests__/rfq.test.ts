import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as rfqRepository from '../repositories/rfq.repository';
import * as rfqService from '../services/rfq.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('RFQ Module', () => {
  describe('Repository', () => {
    test('listRfqs calls findMany and count', async () => {
      prismaMock.rfq.findMany.mockResolvedValue([]);
      prismaMock.rfq.count.mockResolvedValue(0);

      const result = await rfqRepository.listRfqs({ page: 1, limit: 10 });
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(prismaMock.rfq.findMany).toHaveBeenCalled();
    });

    test('createRfq creates nested data inside a transaction', async () => {
      const mockCreatedRfq = { id: 1, title: 'Test RFQ' } as any;
      prismaMock.rfq.create.mockResolvedValue(mockCreatedRfq);
      prismaMock.rfq.findUnique.mockResolvedValue(mockCreatedRfq);

      const input = {
        title: 'Test RFQ',
        category: 'Services',
        description: 'Need help',
        deadline: new Date().toISOString(),
        assignedVendorIds: [1, 2],
        lineItems: [{ itemName: 'Item 1', quantity: 5, unit: 'pcs' }],
        attachments: []
      };

      const result = await rfqRepository.createRfq(1, input);

      expect(result).toEqual(mockCreatedRfq);
      expect(prismaMock.rfq.create).toHaveBeenCalled();
      expect(prismaMock.rfqLineItem.createMany).toHaveBeenCalled();
      expect(prismaMock.rfqVendor.createMany).toHaveBeenCalled();
    });
  });

  describe('Service', () => {
    test('listRfqs resolves Vendor entity ID if user role is VENDOR', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({ id: 10 } as any);
      prismaMock.rfq.findMany.mockResolvedValue([]);
      prismaMock.rfq.count.mockResolvedValue(0);

      const result = await rfqService.listRfqs(
        { id: 2, role: 'VENDOR' },
        { page: '1', limit: '10' }
      );

      expect(result.items).toEqual([]);
      expect(prismaMock.vendor.findUnique).toHaveBeenCalledWith({
        where: { userId: 2 }
      });
    });

    test('createNewRfq throws error if assigned vendor does not exist', async () => {
      prismaMock.vendor.findMany.mockResolvedValue([]);

      const input = {
        title: 'Test RFQ',
        category: 'Services',
        description: 'Need help',
        deadline: new Date().toISOString(),
        assignedVendorIds: [1, 2],
        lineItems: [{ itemName: 'Item 1', quantity: 5, unit: 'pcs' }]
      };

      await expect(rfqService.createNewRfq(1, input)).rejects.toThrow(
        'One or more selected vendors could not be found'
      );
    });

    test('createNewRfq throws error if vendor is blocked', async () => {
      prismaMock.vendor.findMany.mockResolvedValue([
        { id: 1, status: 'BLOCKED' }
      ] as any);

      const input = {
        title: 'Test',
        category: 'Services',
        description: 'Desc',
        deadline: new Date().toISOString(),
        assignedVendorIds: [1],
        lineItems: []
      };

      await expect(rfqService.createNewRfq(1, input)).rejects.toThrow(
        'Cannot assign RFQ to a blocked vendor'
      );
    });
  });
});
