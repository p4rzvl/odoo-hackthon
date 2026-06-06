import { Router } from 'express';
import { listApprovals, getApprovalDetail, approveApproval, rejectApproval } from '../controllers/approval.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

// List all approvals for the current manager
router.get(
  '/', 
  authenticateToken, 
  requireRole(['MANAGER']), 
  listApprovals
);

// Get approval detail with full quotation/RFQ/vendor information
router.get(
  '/:id', 
  authenticateToken, 
  requireRole(['MANAGER']), 
  getApprovalDetail
);

// Approve an approval (L1 or L2)
router.post(
  '/:id/approve', 
  authenticateToken, 
  requireRole(['MANAGER']), 
  approveApproval
);

// Reject an approval (L1 or L2)
router.post(
  '/:id/reject', 
  authenticateToken, 
  requireRole(['MANAGER']), 
  rejectApproval
);

export default router;
