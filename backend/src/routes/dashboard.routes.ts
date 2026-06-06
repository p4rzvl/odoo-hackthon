import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/metrics', authenticateToken, dashboardController.getMetrics);

export default router;
