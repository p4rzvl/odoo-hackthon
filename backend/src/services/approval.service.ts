import * as approvalRepository from '../repositories/approval.repository';
import prisma from '../lib/prisma';
import { logActivity } from '../lib/activityLogger';
import { sendApprovalNotification, sendPoNotification } from '../lib/email';

export const listApprovals = async (userId: number, status?: string) => {
  const approvals = await approvalRepository.listApprovalsByApprover(userId, status);

  // Enrich each approval with sibling (other level) approval data
  const enriched = await Promise.all(
    approvals.map(async (approval) => {
      const sibling = await prisma.approval.findFirst({
        where: {
          quotationId: approval.quotationId,
          level: approval.level === 1 ? 2 : 1
        },
        select: {
          id: true,
          level: true,
          status: true,
          remarks: true,
          actionedAt: true,
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      return { ...approval, siblingApproval: sibling };
    })
  );

  return enriched;
};

export const getApprovalDetail = async (approvalId: number, userId: number) => {
  const approval = await approvalRepository.getApprovalById(approvalId);
  if (!approval) {
    throw new Error('Approval record not found');
  }

  if (approval.approverId !== userId) {
    throw new Error('Access denied: You are not the assigned approver for this item');
  }

  return approval;
};

export const approveApproval = async (userId: number, approvalId: number, remarks: string) => {
  // 1. Fetch and validate the approval
  const approval = await approvalRepository.getApprovalById(approvalId);
  if (!approval) {
    throw new Error('Approval record not found');
  }

  if (approval.approverId !== userId) {
    throw new Error('Access denied: You are not authorized to act on this approval');
  }

  if (approval.status !== 'PENDING') {
    throw new Error(`Forbidden: This approval is already ${approval.status.toLowerCase()}`);
  }

  const quotation = approval.quotation;
  const rfq = quotation.rfq;

  if (approval.level === 1) {
    // === L1 APPROVAL ===
    await approvalRepository.updateApprovalStatus(approvalId, 'APPROVED', remarks);
    await approvalRepository.updateL2ApprovalStatus(quotation.id, 'PENDING');

    // Notify L2 manager
    const l2Approval = await prisma.approval.findFirst({
      where: { quotationId: quotation.id, level: 2 }
    });

    if (l2Approval) {
      await prisma.notification.create({
        data: {
          userId: l2Approval.approverId,
          message: `L1 Approval complete for RFQ "${rfq.title}". Your Level 2 sign-off is now required.`,
          type: 'APPROVAL_REQUEST',
          relatedEntityId: approvalId,
          entityType: 'approval'
        }
      });

      // Email L2 manager
      const l2User = await prisma.user.findUnique({ where: { id: l2Approval.approverId } });
      if (l2User) {
        await sendApprovalNotification(l2User.email, `${l2User.firstName} ${l2User.lastName}`, rfq.title, 2, 'assigned');
      }
    }

    // Log activity
    await logActivity({
      actorId: userId,
      actionType: 'APPROVAL',
      description: `L1 Approval granted for Quotation #${quotation.id} (${quotation.vendor.companyName}) on RFQ "${rfq.title}"`,
      entityId: approvalId,
      entityType: 'approval'
    });

  } else if (approval.level === 2) {
    // === L2 APPROVAL — Final sign-off, generate Purchase Order ===
    await approvalRepository.updateApprovalStatus(approvalId, 'APPROVED', remarks);

    // Generate Purchase Order
    const po = await approvalRepository.createPurchaseOrder(
      quotation.id,
      quotation.vendorId,
      quotation.grandTotal.toNumber()
    );

    // Close the RFQ
    await approvalRepository.updateRfqStatus(rfq.id, 'CLOSED');

    // Notify the officer who created the RFQ
    const officerId = rfq.creator?.id || rfq.createdBy;
    await prisma.notification.create({
      data: {
        userId: officerId,
        message: `L2 Approval complete! Purchase Order ${po.poNumber} generated for RFQ "${rfq.title}" with ${quotation.vendor.companyName}. Total: INR ${quotation.grandTotal.toString()}`,
        type: 'PO_GENERATED',
        relatedEntityId: po.id,
        entityType: 'purchase_order'
      }
    });

    // Email the officer
    const officerUser = rfq.creator;
    if (officerUser) {
      await sendApprovalNotification(officerUser.email, `${officerUser.firstName} ${officerUser.lastName}`, rfq.title, 2, 'approved');
    }

    // Notify the vendor
    const vendorUserId = quotation.vendor.user?.id;
    if (vendorUserId) {
      await prisma.notification.create({
        data: {
          userId: vendorUserId,
          message: `Congratulations! Your quotation for RFQ "${rfq.title}" has been fully approved. Purchase Order ${po.poNumber} has been issued.`,
          type: 'PO_ISSUED',
          relatedEntityId: po.id,
          entityType: 'purchase_order'
        }
      });
    }

    // Email vendor about PO
    const vendorUser = quotation.vendor.user;
    if (vendorUser) {
      await sendPoNotification(
        vendorUser.email,
        `${vendorUser.firstName} ${vendorUser.lastName}`,
        po.poNumber,
        Number(quotation.grandTotal)
      );
    }

    // Log activity
    await logActivity({
      actorId: userId,
      actionType: 'PO',
      description: `L2 Approval granted for Quotation #${quotation.id}. Purchase Order ${po.poNumber} (INR ${quotation.grandTotal.toString()}) generated with ${quotation.vendor.companyName}.`,
      entityId: po.id,
      entityType: 'purchase_order'
    });
  }

  return { success: true, message: `L${approval.level} approval granted successfully.` };
};

export const rejectApproval = async (userId: number, approvalId: number, remarks: string) => {
  // 1. Fetch and validate
  const approval = await approvalRepository.getApprovalById(approvalId);
  if (!approval) {
    throw new Error('Approval record not found');
  }

  if (approval.approverId !== userId) {
    throw new Error('Access denied: You are not authorized to act on this approval');
  }

  if (approval.status !== 'PENDING') {
    throw new Error(`Forbidden: This approval is already ${approval.status.toLowerCase()}`);
  }

  const quotation = approval.quotation;
  const rfq = quotation.rfq;

  // 2. Reject current approval
  await approvalRepository.updateApprovalStatus(approvalId, 'REJECTED', remarks);

  // 3. Reject other level approval if it's still WAITING
  const otherLevel = approval.level === 1 ? 2 : 1;
  const otherApproval = await prisma.approval.findFirst({
    where: { quotationId: approval.quotationId, level: otherLevel }
  });

  if (otherApproval && otherApproval.status === 'WAITING') {
    await prisma.approval.update({
      where: { id: otherApproval.id },
      data: { status: 'REJECTED', actionedAt: new Date() }
    });
  }

  // 4. Reset quotation back to SUBMITTED so officer can re-select
  await prisma.quotation.update({
    where: { id: approval.quotationId },
    data: { status: 'SUBMITTED' }
  });

  // 5. Notify the officer
  const officerId = rfq.creator?.id || rfq.createdBy;
  await prisma.notification.create({
    data: {
      userId: officerId,
      message: `Quotation selection for RFQ "${rfq.title}" (${quotation.vendor.companyName}) was rejected at L${approval.level} level. Remarks: ${remarks}`,
      type: 'APPROVAL_REJECTED',
      relatedEntityId: approvalId,
      entityType: 'approval'
    }
  });

  // Email the officer
  const officerUser = rfq.creator;
  if (officerUser) {
    await sendApprovalNotification(officerUser.email, `${officerUser.firstName} ${officerUser.lastName}`, rfq.title, approval.level, 'rejected');
  }

  // 6. Log activity
  await logActivity({
    actorId: userId,
    actionType: 'APPROVAL',
    description: `L${approval.level} Approval REJECTED for Quotation #${approval.quotationId} (${quotation.vendor.companyName}) on RFQ "${rfq.title}". Reason: ${remarks}`,
    entityId: approvalId,
    entityType: 'approval'
  });

  return { success: true, message: `L${approval.level} approval rejected. Quotation selection has been reset.` };
};
