import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.get('/', authenticateToken, notificationController.listNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);
router.post('/read-all', authenticateToken, notificationController.markAllAsRead);

export default router;
