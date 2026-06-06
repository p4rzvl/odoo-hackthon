import * as quotationRepository from '../repositories/quotation.repository';
import * as rfqRepository from '../repositories/rfq.repository';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { logActivity } from '../lib/activityLogger';
import { sendApprovalNotification } from '../lib/email';
import { CreateQuotationInput, UpdateQuotationInput } from '../validations/quotation.validation';

export const submitNewQuotation = async (userId: number, data: CreateQuotationInput) => {
  // 1. Identify associated vendor profile
  const vendor = await prisma.vendor.findUnique({
    where: { userId }
  });
  if (!vendor || vendor.status !== 'ACTIVE') {
    throw new Error('Access Denied: Only active suppliers can submit bids.');
  }

  // 2. Retrieve and validate RFQ specifications
  const rfq = await rfqRepository.getRfqById(data.rfqId);
  if (!rfq) {
    throw new Error('RFQ specification not found.');
  }

  if (rfq.status !== 'PUBLISHED') {
    throw new Error('Bidding is closed or not started yet.');
  }

  if (new Date(rfq.deadline) < new Date()) {
    throw new Error('RFQ bidding deadline has expired.');
  }

  // 3. Verify vendor was invited to this RFQ
  const isInvited = rfq.rfqVendors.some(rv => rv.vendorId === vendor.id);
  if (!isInvited) {
    throw new Error('Access Denied: You are not invited to submit a bid for this RFQ.');
  }

  // 3.5 Check submitted values if status is SUBMITTED
  if (data.status === 'SUBMITTED') {
    for (const item of data.items) {
      if (item.unitPrice <= 0) {
        throw new Error(`Unit price for line item must be greater than zero for final submissions.`);
      }
      if (item.deliveryDays <= 0) {
        throw new Error(`Delivery timeline for line item must be at least 1 day for final submissions.`);
      }
    }
  }

  // 4. Create record
  const quotation = await quotationRepository.createQuotation(vendor.id, data);
  if (!quotation) {
    throw new Error('Database transaction failed while creating quotation.');
  }

  // 5. Audit log
  await logActivity({
    actorId: userId,
    actionType: 'QUOTATION',
    description: `Supplier "${vendor.companyName}" saved quotation as ${data.status} for RFQ "${rfq.title}" (Grand Total: INR ${quotation.grandTotal.toString()})`,
    entityId: quotation.id,
    entityType: 'quotation'
  });

  return quotation;
};

export const updateQuotationDraft = async (userId: number, id: number, data: UpdateQuotationInput) => {
  // 1. Resolve vendor profile
  const vendor = await prisma.vendor.findUnique({
    where: { userId }
  });
  if (!vendor) {
    throw new Error('Access Denied: Associated supplier profile not found.');
  }

  // 2. Fetch and check existing quotation
  const quotation = await quotationRepository.getQuotationById(id);
  if (!quotation) {
    throw new Error('Quotation bid not found.');
  }

  if (quotation.vendorId !== vendor.id) {
    throw new Error('Access Denied: You are not authorized to edit this quotation.');
  }

  if (quotation.status !== 'DRAFT') {
    throw new Error('Forbidden: Only quotations in DRAFT status can be modified.');
  }

  if (new Date(quotation.rfq.deadline) < new Date()) {
    throw new Error('Forbidden: Bidding deadline has expired.');
  }

  if (data.status === 'SUBMITTED' && data.items) {
    for (const item of data.items) {
      if (item.unitPrice <= 0) {
        throw new Error(`Unit price for line item must be greater than zero for final submissions.`);
      }
      if (item.deliveryDays <= 0) {
        throw new Error(`Delivery timeline for line item must be at least 1 day for final submissions.`);
      }
    }
  }

  const updated = await quotationRepository.updateQuotation(id, data);

  // 3. Log activity
  await logActivity({
    actorId: userId,
    actionType: 'QUOTATION',
    description: `Supplier "${vendor.companyName}" updated draft quotation for RFQ "${quotation.rfq.title}" (New Total: INR ${updated.grandTotal.toString()})`,
    entityId: id,
    entityType: 'quotation'
  });

  return updated;
};

export const selectQuotationForApproval = async (officerId: number, rfqId: number, quotationId: number) => {
  // 1. Validate RFQ and status
  const rfq = await rfqRepository.getRfqById(rfqId);
  if (!rfq) throw new Error('RFQ not found');

  if (rfq.status !== 'PUBLISHED') {
    throw new Error('Bidding round is not in active PUBLISHED status.');
  }

  // 2. Execute vendor selection and trigger sequential manager approvals
  const selected = await quotationRepository.selectQuotationAndCreateApprovals(rfqId, quotationId);

  // 3. Find newly created L1 approval record to notify L1 manager
  const l1Approval = await prisma.approval.findFirst({
    where: { quotationId, level: 1 }
  });

  if (l1Approval) {
    await prisma.notification.create({
      data: {
        userId: l1Approval.approverId,
        message: `New quotation bid selection for RFQ "${rfq.title}" requires your Level 1 Approval.`,
        type: 'APPROVAL_REQUEST',
        relatedEntityId: quotationId,
        entityType: 'quotation'
      }
    });

    // Email L1 manager
    const l1User = await prisma.user.findUnique({ where: { id: l1Approval.approverId } });
    if (l1User) {
      await sendApprovalNotification(l1User.email, `${l1User.firstName} ${l1User.lastName}`, rfq.title, 1, 'assigned');
    }
  }

  // 4. Log activity
  await logActivity({
    actorId: officerId,
    actionType: 'APPROVAL',
    description: `Officer selected quotation bid from Vendor ID ${selected.vendorId} for RFQ "${rfq.title}" — approval chain initiated`,
    entityId: quotationId,
    entityType: 'quotation'
  });

  return selected;
};
