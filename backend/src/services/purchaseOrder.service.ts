import * as poRepository from '../repositories/purchaseOrder.repository';
import prisma from '../lib/prisma';
import { logActivity } from '../lib/activityLogger';
import { PoStatus } from '@prisma/client';

export const listPurchaseOrders = async (
  user: { id: number; role: string },
  query: { status?: string; page?: string; limit?: string }
) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));

  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
    if (!vendor) {
      return { items: [], total: 0 };
    }
    return poRepository.listPurchaseOrders({
      vendorId: vendor.id,
      status: query.status,
      page,
      limit
    });
  }

  return poRepository.listPurchaseOrders({
    status: query.status,
    page,
    limit
  });
};

export const getPurchaseOrderDetail = async (id: number, user: { id: number; role: string }) => {
  const po = await poRepository.getPurchaseOrderById(id);
  if (!po) {
    throw new Error('Purchase Order not found');
  }

  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
    if (!vendor || po.vendorId !== vendor.id) {
      throw new Error('Access denied: You are not authorized to view this Purchase Order');
    }
  }

  return po;
};

export const updatePoStatus = async (id: number, userId: number, status: PoStatus) => {
  const po = await poRepository.getPurchaseOrderById(id);
  if (!po) {
    throw new Error('Purchase Order not found');
  }

  const updated = await poRepository.updatePoStatus(id, status);

  await logActivity({
    actorId: userId,
    actionType: 'PO',
    description: `Purchase Order ${po.poNumber} status updated to ${status}`,
    entityId: id,
    entityType: 'purchase_order'
  });

  return updated;
};
