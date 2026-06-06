import prisma from '../lib/prisma';

export const getNextInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInv = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { id: 'desc' },
    select: { invoiceNumber: true }
  });

  let nextSeq = 1;
  if (lastInv) {
    const lastSeq = parseInt(lastInv.invoiceNumber.replace(prefix, ''), 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
};

export const createInvoice = async (data: {
  invoiceNumber: string;
  poId: number;
  invoiceDate: Date;
  dueDate: Date;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
}) => {
  return prisma.invoice.create({ data });
};

export const listInvoices = async (filters: {
  status?: string;
  page: number;
  limit: number;
}) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;
  const where: any = {};

  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            totalAmount: true,
            vendor: {
              select: {
                id: true,
                companyName: true,
                gstNumber: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.invoice.count({ where })
  ]);

  return { items, total };
};

export const getInvoiceById = async (id: number) => {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      purchaseOrder: {
        select: {
          id: true,
          poNumber: true,
          totalAmount: true,
          status: true,
          quotation: {
            include: {
              rfq: { select: { id: true, title: true, category: true, creator: { select: { id: true } } } },
              items: {
                include: { rfqLineItem: true }
              },
              vendor: {
                select: {
                  id: true,
                  companyName: true,
                  gstNumber: true,
                  address: true,
                  contactNumber: true
                }
              }
            }
          },
          vendor: {
            select: {
              id: true,
              companyName: true,
              gstNumber: true,
              address: true,
              contactNumber: true
            }
          }
        }
      }
    }
  });
};

export const markInvoiceAsPaid = async (id: number, paidRemarks?: string) => {
  return prisma.invoice.update({
    where: { id },
    data: { status: 'PAID', paidAt: new Date(), paidRemarks }
  });
};

export const getPurchaseOrderForInvoice = async (poId: number) => {
  return prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      quotation: {
        include: {
          rfq: { select: { id: true, title: true } },
          vendor: { select: { id: true, companyName: true, gstNumber: true, address: true, contactNumber: true } },
          items: { include: { rfqLineItem: true } }
        }
      },
      vendor: {
        select: {
          id: true, companyName: true, gstNumber: true, address: true, contactNumber: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } }
        }
      },
      invoices: {
        select: { id: true, invoiceNumber: true, grandTotal: true, status: true }
      }
    }
  });
};
