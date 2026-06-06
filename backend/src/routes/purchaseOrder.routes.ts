import { Router } from 'express';
import { listPurchaseOrders, getPurchaseOrderDetail, updatePoStatus } from '../controllers/purchaseOrder.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validateBody } from '../middleware/validate';
import { updatePoStatusSchema } from '../validations/purchaseOrder.validation';

const router = Router();

// List Purchase Orders
router.get(
  '/',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR']),
  listPurchaseOrders
);

// Get Purchase Order detail
router.get(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR']),
  getPurchaseOrderDetail
);

// Update Purchase Order status
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole(['ADMIN', 'OFFICER']),
  validateBody(updatePoStatusSchema),
  updatePoStatus
);

export default router;
