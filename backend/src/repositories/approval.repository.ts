import prisma from '../lib/prisma';
import { ApprovalStatus } from '@prisma/client';

export const listApprovalsByApprover = async (approverId: number, status?: string) => {
  const where: any = { approverId };
  
  if (status) {
    where.status = status as ApprovalStatus;
  }

  return prisma.approval.findMany({
    where,
    include: {
      quotation: {
        include: {
          rfq: {
            select: {
              id: true,
              title: true,
              category: true,
              deadline: true,
              status: true,
              createdBy: true
            }
          },
          vendor: {
            select: {
              id: true,
              companyName: true,
              gstNumber: true,
              category: true
            }
          },
          items: {
            include: {
              rfqLineItem: true
            }
          }
        }
      },
      approver: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { assignedAt: 'desc' }
  });
};

export const getApprovalById = async (id: number) => {
  return prisma.approval.findUnique({
    where: { id },
    include: {
      quotation: {
        include: {
          rfq: {
            include: {
              creator: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              },
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
          },
          items: {
            include: {
              rfqLineItem: true
            }
          }
        }
      },
      approver: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      }
    }
  });
};

export const updateApprovalStatus = async (
  id: number, 
  status: ApprovalStatus, 
  remarks?: string
) => {
  return prisma.approval.update({
    where: { id },
    data: {
      status,
      remarks,
      actionedAt: new Date()
    }
  });
};

export const updateL2ApprovalStatus = async (
  quotationId: number,
  status: ApprovalStatus
) => {
  return prisma.approval.updateMany({
    where: {
      quotationId,
      level: 2
    },
    data: {
      status,
      ...(status === 'PENDING' ? {} : { actionedAt: new Date() })
    }
  });
};

export const getNextPoNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `PO-${year}-`;
  
  const lastPo = await prisma.purchaseOrder.findFirst({
    where: {
      poNumber: {
        startsWith: prefix
      }
    },
    orderBy: { id: 'desc' },
    select: { poNumber: true }
  });

  let nextSeq = 1;
  if (lastPo) {
    const lastSeq = parseInt(lastPo.poNumber.replace(prefix, ''), 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
};

export const createPurchaseOrder = async (
  quotationId: number,
  vendorId: number,
  totalAmount: number
) => {
  const poNumber = await getNextPoNumber();
  
  return prisma.purchaseOrder.create({
    data: {
      poNumber,
      quotationId,
      vendorId,
      totalAmount,
      status: 'APPROVED'
    }
  });
};

export const updateRfqStatus = async (rfqId: number, status: string) => {
  return prisma.rfq.update({
    where: { id: rfqId },
    data: { status: status as any }
  });
};

export const getPendingApprovalsCount = async (approverId: number) => {
  return prisma.approval.count({
    where: {
      approverId,
      status: 'PENDING'
    }
  });
};
