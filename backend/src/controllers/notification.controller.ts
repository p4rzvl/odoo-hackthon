import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { AuthenticatedRequest } from '../types';

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const type = req.query.type as string | undefined;
    const isRead = req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined;

    const result = await notificationService.listNotifications(userId, { type, isRead, page, limit });
    return res.json({ success: true, data: result, error: null });
  } catch (error: any) {
    return res.status(400).json({ success: false, data: null, error: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const count = await notificationService.getUnreadCount(userId);
    return res.json({ success: true, data: { count }, error: null });
  } catch (error: any) {
    return res.status(400).json({ success: false, data: null, error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const notificationId = parseInt(req.params.id as string);
    if (isNaN(notificationId)) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid notification ID' });
    }

    const notification = await notificationService.markAsRead(userId, notificationId);
    return res.json({ success: true, data: notification, error: null });
  } catch (error: any) {
    return res.status(400).json({ success: false, data: null, error: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    await notificationService.markAllAsRead(userId);
    return res.json({ success: true, data: null, error: null });
  } catch (error: any) {
    return res.status(400).json({ success: false, data: null, error: error.message });
  }
};
