import prisma from '../lib/prisma';
import { QuotationStatus, ApprovalStatus } from '@prisma/client';
import { CreateQuotationInput, UpdateQuotationInput } from '../validations/quotation.validation';

export const getQuotationById = async (id: number) => {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          rfqLineItem: true
        }
      },
      rfq: {
        include: {
          lineItems: true
        }
      },
      vendor: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });
};

export const listQuotations = async (filters: {
  rfqId?: number;
  vendorId?: number;
  status?: string;
}) => {
  const { rfqId, vendorId, status } = filters;
  const where: any = {};

  if (rfqId) where.rfqId = rfqId;
  if (vendorId) where.vendorId = vendorId;
  if (status) where.status = status as QuotationStatus;

  return prisma.quotation.findMany({
    where,
    include: {
      items: true,
      vendor: true,
      rfq: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const createQuotation = async (vendorId: number, data: CreateQuotationInput) => {
  return prisma.$transaction(async (tx) => {
    // 1. Load RFQ Line Items to get quantities for calculation
    const rfqLineItems = await tx.rfqLineItem.findMany({
      where: { rfqId: data.rfqId }
    });

    const itemQuantityMap = new Map(rfqLineItems.map(item => [item.id, item.quantity]));

    // 2. Calculate Subtotal
    let subtotal = 0;
    const itemsData = data.items.map(item => {
      const quantity = itemQuantityMap.get(item.rfqLineItemId) || 0;
      const totalPrice = quantity * item.unitPrice;
      subtotal += totalPrice;
      return {
        rfqLineItemId: item.rfqLineItemId,
        unitPrice: item.unitPrice,
        totalPrice,
        deliveryDays: item.deliveryDays
      };
    });

    // 3. Tax & Grand Total
    const taxAmount = subtotal * (data.gstPercent / 100);
    const grandTotal = subtotal + taxAmount;

    // 4. Create Quotation Core
    const quotation = await tx.quotation.create({
      data: {
        rfqId: data.rfqId,
        vendorId,
        gstPercent: data.gstPercent,
        subtotal,
        taxAmount,
        grandTotal,
        status: data.status as QuotationStatus
      }
    });

    // 5. Create Quotation Items
    const itemsWithId = itemsData.map(item => ({
      ...item,
      quotationId: quotation.id
    }));
    await tx.quotationItem.createMany({
      data: itemsWithId
    });

    return tx.quotation.findUnique({
      where: { id: quotation.id },
      include: { items: true }
    });
  });
};

export const updateQuotation = async (id: number, data: UpdateQuotationInput) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.quotation.findUnique({
      where: { id },
      include: { rfq: { include: { lineItems: true } } }
    });
    if (!existing) throw new Error('Quotation not found');

    let subtotal = existing.subtotal.toNumber();
    let gstPercent = data.gstPercent !== undefined ? data.gstPercent : existing.gstPercent.toNumber();

    // Re-sync items if updated
    if (data.items) {
      await tx.quotationItem.deleteMany({ where: { quotationId: id } });

      const itemQuantityMap = new Map(existing.rfq.lineItems.map(item => [item.id, item.quantity]));
      subtotal = 0;

      const newItems = data.items.map(item => {
        const quantity = itemQuantityMap.get(item.rfqLineItemId) || 0;
        const totalPrice = quantity * item.unitPrice;
        subtotal += totalPrice;
        return {
          quotationId: id,
          rfqLineItemId: item.rfqLineItemId,
          unitPrice: item.unitPrice,
          totalPrice,
          deliveryDays: item.deliveryDays
        };
      });

      await tx.quotationItem.createMany({ data: newItems });
    }

    const taxAmount = subtotal * (gstPercent / 100);
    const grandTotal = subtotal + taxAmount;

    return tx.quotation.update({
      where: { id },
      data: {
        gstPercent,
        subtotal,
        taxAmount,
        grandTotal,
        status: data.status as QuotationStatus
      },
      include: { items: true }
    });
  });
};

export const selectQuotationAndCreateApprovals = async (rfqId: number, quotationId: number) => {
  return prisma.$transaction(async (tx) => {
    // 1. Mark selected quotation
    const selected = await tx.quotation.update({
      where: { id: quotationId },
      data: { status: 'SELECTED' }
    });

    // 2. Reject other quotations for this RFQ
    await tx.quotation.updateMany({
      where: {
        rfqId,
        id: { not: quotationId }
      },
      data: { status: 'REJECTED' }
    });

    // 3. Find first two managers by ID (for L1 and L2 Approvals)
    const managers = await tx.user.findMany({
      where: { role: 'MANAGER', isActive: true },
      orderBy: { id: 'asc' },
      take: 2
    });

    if (managers.length < 2) {
      throw new Error('Approval workflow requires at least 2 active Managers configured in the system.');
    }

    // 4. Create Approval records
    // Level 1 Approver (status: PENDING)
    await tx.approval.create({
      data: {
        quotationId,
        approverId: managers[0].id,
        level: 1,
        status: 'PENDING'
      }
    });

    // Level 2 Approver (status: WAITING)
    await tx.approval.create({
      data: {
        quotationId,
        approverId: managers[1].id,
        level: 2,
        status: 'WAITING'
      }
    });

    return selected;
  });
};
