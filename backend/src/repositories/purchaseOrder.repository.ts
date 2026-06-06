import prisma from '../lib/prisma';
import { PoStatus } from '@prisma/client';

export const listPurchaseOrders = async (filters: {
  vendorId?: number;
  status?: string;
  page: number;
  limit: number;
}) => {
  const { vendorId, status, page, limit } = filters;
  const skip = (page - 1) * limit;
  const where: any = {};

  if (vendorId) where.vendorId = vendorId;
  if (status) where.status = status as PoStatus;

  const [items, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: {
        quotation: {
          select: {
            id: true,
            rfqId: true,
            gstPercent: true,
            subtotal: true,
            taxAmount: true,
            grandTotal: true,
            status: true,
            rfq: {
              select: {
                id: true,
                title: true,
                category: true,
                deadline: true,
                status: true
              }
            }
          }
        },
        vendor: {
          select: {
            id: true,
            companyName: true,
            gstNumber: true,
            category: true,
            contactNumber: true,
            address: true
          }
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            grandTotal: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.purchaseOrder.count({ where })
  ]);

  return { items, total };
};

export const getPurchaseOrderById = async (id: number) => {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      quotation: {
        include: {
          rfq: {
            select: {
              id: true,
              title: true,
              category: true,
              description: true,
              deadline: true,
              status: true,
              createdBy: true,
              creator: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          items: {
            include: {
              rfqLineItem: true
            }
          },
          vendor: {
            select: {
              id: true,
              companyName: true,
              gstNumber: true,
              category: true,
              contactNumber: true,
              address: true
            }
          }
        }
      },
      vendor: {
        select: {
          id: true,
          companyName: true,
          gstNumber: true,
          category: true,
          contactNumber: true,
          address: true
        }
      },
      invoices: {
        select: {
          id: true,
          invoiceNumber: true,
          grandTotal: true,
          status: true,
          createdAt: true
        }
      }
    }
  });
};

export const updatePoStatus = async (id: number, status: PoStatus) => {
  return prisma.purchaseOrder.update({
    where: { id },
    data: { status },
    include: {
      quotation: {
        select: {
          rfq: { select: { title: true } },
          vendor: { select: { companyName: true } }
        }
      }
    }
  });
};
