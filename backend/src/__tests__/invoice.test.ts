import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as invoiceRepository from '../repositories/invoice.repository';
import * as invoiceService from '../services/invoice.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Invoice Module', () => {
  describe('Repository', () => {
    test('getNextInvoiceNumber calculates correct sequence', async () => {
      const currentYear = new Date().getFullYear();
      prismaMock.invoice.findFirst.mockResolvedValue({
        invoiceNumber: `INV-${currentYear}-000050`
      } as any);

      const nextNo = await invoiceRepository.getNextInvoiceNumber();
      expect(nextNo).toBe(`INV-${currentYear}-000051`);
    });

    test('getNextInvoiceNumber handles first invoice of the year', async () => {
      const currentYear = new Date().getFullYear();
      prismaMock.invoice.findFirst.mockResolvedValue(null);

      const nextNo = await invoiceRepository.getNextInvoiceNumber();
      expect(nextNo).toBe(`INV-${currentYear}-000001`);
    });
  });

  describe('Service', () => {
    test('createInvoiceFromPo calculates taxes and calls createInvoice', async () => {
      const mockPo = {
        id: 1,
        poNumber: 'PO-2026-000001',
        status: 'APPROVED',
        totalAmount: 10000,
        vendor: {
          companyName: 'Vendor A',
          gstNumber: 'GST123',
          user: { id: 9, email: 'v@example.com', firstName: 'First', lastName: 'Last' }
        },
        invoices: []
      } as any;

      prismaMock.purchaseOrder.findUnique.mockResolvedValue(mockPo);
      prismaMock.invoice.findFirst.mockResolvedValue(null);
      prismaMock.invoice.create.mockResolvedValue({
        id: 100,
        invoiceNumber: 'INV-2026-000001',
        grandTotal: 11800
      } as any);

      const result = await invoiceService.createInvoiceFromPo(
        2,
        1,
        new Date(),
        new Date()
      );

      expect(result.id).toBe(100);
      expect(prismaMock.invoice.create).toHaveBeenCalledWith({
        data: {
          invoiceNumber: expect.stringContaining('INV-'),
          poId: 1,
          invoiceDate: expect.any(Date),
          dueDate: expect.any(Date),
          subtotal: 10000,
          cgst: 900,
          sgst: 900,
          grandTotal: 11800
        }
      });
    });

    test('createInvoiceFromPo throws error if invoice already exists', async () => {
      const mockPo = {
        id: 1,
        status: 'APPROVED',
        invoices: [{ id: 100 }]
      } as any;

      prismaMock.purchaseOrder.findUnique.mockResolvedValue(mockPo);

      await expect(
        invoiceService.createInvoiceFromPo(2, 1, new Date(), new Date())
      ).rejects.toThrow('An invoice has already been generated for this Purchase Order');
    });

    test('markInvoiceAsPaid updates status and records remarks', async () => {
      const mockInvoice = {
        id: 10,
        invoiceNumber: 'INV-10',
        status: 'PENDING_PAYMENT',
        grandTotal: 5000,
        purchaseOrder: {
          quotation: {
            rfq: {
              creator: { id: 3 }
            }
          }
        }
      } as any;

      prismaMock.invoice.findUnique.mockResolvedValue(mockInvoice);
      prismaMock.invoice.update.mockResolvedValue({
        ...mockInvoice,
        status: 'PAID'
      } as any);

      const result = await invoiceService.markInvoiceAsPaid(3, 10, 'Paid via bank transfer');

      expect(result.status).toBe('PAID');
      expect(prismaMock.invoice.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          status: 'PAID',
          paidAt: expect.any(Date),
          paidRemarks: 'Paid via bank transfer'
        }
      });
    });
  });
});
