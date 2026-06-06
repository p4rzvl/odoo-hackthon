import * as rfqRepository from '../repositories/rfq.repository';
import prisma from '../lib/prisma';
import { CreateRfqInput, UpdateRfqInput } from '../validations/rfq.validation';

export const listRfqs = async (
  user: { id: number; role: string },
  query: { status?: string; page?: string; limit?: string }
) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));

  // If user is a VENDOR, we must resolve their Vendor entity ID
  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
    if (!vendor) {
      return { items: [], total: 0 };
    }

    return rfqRepository.listRfqs({
      status: query.status,
      vendorId: vendor.id,
      page,
      limit
    });
  }

  // Officers or Managers can see RFQs they created or general list
  return rfqRepository.listRfqs({
    status: query.status,
    createdBy: user.role === 'OFFICER' ? user.id : undefined,
    page,
    limit
  });
};

export const getRfqDetail = async (id: number, user: { id: number; role: string }) => {
  const rfq = await rfqRepository.getRfqById(id);
  if (!rfq) {
    throw new Error('RFQ not found');
  }

  // If user is a Vendor, verify they are actually assigned to this RFQ
  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
    if (!vendor) {
      throw new Error('Access denied: Associated vendor profile not found');
    }

    const isAssigned = rfq.rfqVendors.some(rv => rv.vendorId === vendor.id);
    if (!isAssigned) {
      throw new Error('Access denied: You are not invited to this RFQ');
    }

    // Hide Draft RFQs from vendors
    if (rfq.status === 'DRAFT') {
      throw new Error('RFQ not found');
    }
  }

  return rfq;
};

export const createNewRfq = async (createdBy: number, data: CreateRfqInput) => {
  // Validate that all assigned vendors exist and are ACTIVE (not blocked)
  const vendors = await prisma.vendor.findMany({
    where: {
      id: { in: data.assignedVendorIds }
    }
  });

  if (vendors.length !== data.assignedVendorIds.length) {
    throw new Error('One or more selected vendors could not be found');
  }

  const hasBlockedVendor = vendors.some(v => v.status === 'BLOCKED');
  if (hasBlockedVendor) {
    throw new Error('Cannot assign RFQ to a blocked vendor');
  }

  return rfqRepository.createRfq(createdBy, data);
};

export const updateExistingRfq = async (id: number, creatorId: number, data: UpdateRfqInput) => {
  const rfq = await rfqRepository.getRfqById(id);
  if (!rfq) {
    throw new Error('RFQ not found');
  }

  if (rfq.createdBy !== creatorId) {
    throw new Error('Access denied: Only the creator of the RFQ can modify it');
  }

  if (rfq.status !== 'DRAFT') {
    throw new Error('Forbidden: Only RFQs in DRAFT status can be modified');
  }

  // Validate vendors if updated
  if (data.assignedVendorIds) {
    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: data.assignedVendorIds }
      }
    });

    if (vendors.length !== data.assignedVendorIds.length) {
      throw new Error('One or more selected vendors could not be found');
    }

    const hasBlockedVendor = vendors.some(v => v.status === 'BLOCKED');
    if (hasBlockedVendor) {
      throw new Error('Cannot assign RFQ to a blocked vendor');
    }
  }

  return rfqRepository.updateRfq(id, data);
};

export const publishRfq = async (id: number, creatorId: number) => {
  const rfq = await rfqRepository.getRfqById(id);
  if (!rfq) {
    throw new Error('RFQ not found');
  }

  if (rfq.createdBy !== creatorId) {
    throw new Error('Access denied: Only the creator can publish the RFQ');
  }

  if (rfq.status !== 'DRAFT') {
    throw new Error('RFQ is already published or closed');
  }

  // Update status in DB
  const updatedRfq = await rfqRepository.updateRfqStatus(id, 'PUBLISHED');

  // Trigger notifications for all assigned vendors
  if (rfq.rfqVendors && rfq.rfqVendors.length > 0) {
    const notifications = rfq.rfqVendors.map(rv => ({
      userId: rv.vendor.userId,
      message: `You have been invited to submit a quotation for RFQ: "${rfq.title}"`,
      type: 'RFQ_INVITATION',
      relatedEntityId: rfq.id
    }));

    await prisma.notification.createMany({
      data: notifications
    });
  }

  return updatedRfq;
};
