import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import * as activityLogController from '../controllers/activityLog.controller';

const router = Router();

router.get('/', authenticateToken, requireRole(['ADMIN', 'OFFICER', 'MANAGER', 'VENDOR']), activityLogController.listActivityLogs);
router.get('/:id', authenticateToken, requireRole(['ADMIN', 'OFFICER', 'MANAGER', 'VENDOR']), activityLogController.getActivityLogDetail);

export default router;
