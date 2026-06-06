import prisma from '../lib/prisma';
import { RfqStatus } from '@prisma/client';
import { CreateRfqInput, UpdateRfqInput } from '../validations/rfq.validation';

export const listRfqs = async (filters: {
  status?: string;
  createdBy?: number;
  vendorId?: number; // for vendors to list RFQs they are invited to
  page: number;
  limit: number;
}) => {
  const { status, createdBy, vendorId, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status as RfqStatus;
  }

  if (createdBy) {
    where.createdBy = createdBy;
  }

  if (vendorId) {
    where.rfqVendors = {
      some: {
        vendorId
      }
    };
    // Vendors should only see Published or Closed RFQs, not Drafts
    if (!status) {
      where.status = {
        in: ['PUBLISHED', 'CLOSED'] as RfqStatus[]
      };
    }
  }

  const include: any = {
    creator: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    },
    rfqVendors: {
      include: {
        vendor: true
      }
    },
    _count: {
      select: {
        lineItems: true,
        quotations: true
      }
    }
  };

  if (vendorId) {
    include.quotations = {
      where: { vendorId }
    };
  }

  const [items, total] = await Promise.all([
    prisma.rfq.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.rfq.count({ where })
  ]);

  return { items, total };
};

export const getRfqById = async (id: number) => {
  return prisma.rfq.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      lineItems: true,
      rfqVendors: {
        include: {
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
      },
      attachments: true
    }
  });
};

export const createRfq = async (createdBy: number, data: CreateRfqInput) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create RFQ core
    const rfq = await tx.rfq.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        deadline: new Date(data.deadline),
        createdBy,
        status: 'DRAFT'
      }
    });

    // 2. Create nested line items
    const lineItemData = data.lineItems.map(item => ({
      rfqId: rfq.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit
    }));
    await tx.rfqLineItem.createMany({
      data: lineItemData
    });

    // 3. Create nested vendor assignments
    const vendorAssignmentData = data.assignedVendorIds.map(vendorId => ({
      rfqId: rfq.id,
      vendorId
    }));
    await tx.rfqVendor.createMany({
      data: vendorAssignmentData
    });

    // 4. Create nested attachments if any
    if (data.attachments && data.attachments.length > 0) {
      const attachmentData = data.attachments.map(att => ({
        rfqId: rfq.id,
        fileName: att.fileName,
        filePath: att.filePath
      }));
      await tx.rfqAttachment.createMany({
        data: attachmentData
      });
    }

    return tx.rfq.findUnique({
      where: { id: rfq.id },
      include: {
        lineItems: true,
        rfqVendors: true,
        attachments: true
      }
    });
  });
};

export const updateRfq = async (id: number, data: UpdateRfqInput) => {
  return prisma.$transaction(async (tx) => {
    // 1. Update basic RFQ fields
    await tx.rfq.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        deadline: data.deadline ? new Date(data.deadline) : undefined
      }
    });

    // 2. Sync line items if provided (delete existing, write new)
    if (data.lineItems) {
      await tx.rfqLineItem.deleteMany({ where: { rfqId: id } });
      const lineItemData = data.lineItems.map(item => ({
        rfqId: id,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit
      }));
      await tx.rfqLineItem.createMany({ data: lineItemData });
    }

    // 3. Sync vendor assignments if provided (delete existing, write new)
    if (data.assignedVendorIds) {
      await tx.rfqVendor.deleteMany({ where: { rfqId: id } });
      const vendorAssignmentData = data.assignedVendorIds.map(vendorId => ({
        rfqId: id,
        vendorId
      }));
      await tx.rfqVendor.createMany({ data: vendorAssignmentData });
    }

    // 4. Sync attachments if provided (delete existing, write new)
    if (data.attachments) {
      await tx.rfqAttachment.deleteMany({ where: { rfqId: id } });
      if (data.attachments.length > 0) {
        const attachmentData = data.attachments.map(att => ({
          rfqId: id,
          fileName: att.fileName,
          filePath: att.filePath
        }));
        await tx.rfqAttachment.createMany({ data: attachmentData });
      }
    }

    return tx.rfq.findUnique({
      where: { id },
      include: {
        lineItems: true,
        rfqVendors: true,
        attachments: true
      }
    });
  });
};

export const updateRfqStatus = async (id: number, status: RfqStatus) => {
  return prisma.rfq.update({
    where: { id },
    data: { status }
  });
};
