import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';

const router = Router();

// Endpoint URL maps to /api/health or /api/v1/health based on configuration
router.get('/health', checkHealth);

export default router;
