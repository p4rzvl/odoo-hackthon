import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import * as reportController from '../controllers/report.controller';

const router = Router();

router.get('/overview', authenticateToken, requireRole(['ADMIN', 'OFFICER', 'MANAGER', 'VENDOR']), reportController.getOverview);
router.get('/spend-trend', authenticateToken, requireRole(['ADMIN', 'OFFICER', 'MANAGER']), reportController.getSpendTrend);
router.get('/spend-by-vendor', authenticateToken, requireRole(['ADMIN', 'OFFICER', 'MANAGER']), reportController.getSpendByVendor);
router.get('/export/csv', authenticateToken, requireRole(['ADMIN', 'OFFICER', 'MANAGER']), reportController.exportCsv);

export default router;
