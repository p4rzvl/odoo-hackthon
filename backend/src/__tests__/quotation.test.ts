import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as quotationRepository from '../repositories/quotation.repository';
import * as quotationService from '../services/quotation.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Quotation Module', () => {
  describe('Repository', () => {
    test('createQuotation calculates totals correctly and saves quotation', async () => {
      prismaMock.rfqLineItem.findMany.mockResolvedValue([
        { id: 1, quantity: 10 }
      ] as any);

      const mockSaved = {
        id: 100,
        subtotal: 1000,
        taxAmount: 180,
        grandTotal: 1180,
        status: 'DRAFT'
      } as any;
      prismaMock.quotation.create.mockResolvedValue(mockSaved);
      prismaMock.quotation.findUnique.mockResolvedValue(mockSaved);

      const input = {
        rfqId: 1,
        gstPercent: 18,
        status: 'DRAFT' as const,
        items: [{ rfqLineItemId: 1, unitPrice: 100, deliveryDays: 3 }]
      };

      const result = await quotationRepository.createQuotation(5, input);

      expect(result).toEqual(mockSaved);
      expect(prismaMock.rfqLineItem.findMany).toHaveBeenCalled();
      expect(prismaMock.quotation.create).toHaveBeenCalledWith({
        data: {
          rfqId: 1,
          vendorId: 5,
          gstPercent: 18,
          subtotal: 1000,
          taxAmount: 180,
          grandTotal: 1180,
          status: 'DRAFT'
        }
      });
      expect(prismaMock.quotationItem.createMany).toHaveBeenCalled();
    });
  });

  describe('Service', () => {
    test('submitNewQuotation throws error if vendor is not active', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 5,
        status: 'PENDING'
      } as any);

      const input = {
        rfqId: 1,
        gstPercent: 18,
        status: 'DRAFT' as const,
        items: [] as any[]
      };

      await expect(quotationService.submitNewQuotation(2, input)).rejects.toThrow(
        'Access Denied: Only active suppliers can submit bids.'
      );
    });

    test('submitNewQuotation validates unit prices for SUBMITTED state', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue({
        id: 5,
        status: 'ACTIVE'
      } as any);
      prismaMock.rfq.findUnique.mockResolvedValue({
        id: 1,
        status: 'PUBLISHED',
        deadline: new Date(Date.now() + 100000).toISOString(),
        rfqVendors: [{ vendorId: 5 }]
      } as any);

      const input = {
        rfqId: 1,
        gstPercent: 18,
        status: 'SUBMITTED' as const,
        items: [{ rfqLineItemId: 1, unitPrice: 0, deliveryDays: 5 }]
      };

      await expect(quotationService.submitNewQuotation(2, input)).rejects.toThrow(
        'Unit price for line item must be greater than zero for final submissions.'
      );
    });
  });
});
