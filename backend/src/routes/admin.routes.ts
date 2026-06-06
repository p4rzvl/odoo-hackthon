import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/activate', adminController.activateUser);
router.patch('/users/:id/approval-level', adminController.setApprovalLevel);

export default router;
