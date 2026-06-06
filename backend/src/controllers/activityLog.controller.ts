import { Request, Response } from 'express';
import * as activityLogService from '../services/activityLog.service';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';

export const listActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const filters = {
      role: authReq.user.role as Role,
      userId: authReq.user.id,
      actionType: req.query.actionType as string,
      page: parseInt(req.query.page as string || '1', 10),
      limit: parseInt(req.query.limit as string || '20', 10)
    };

    const { items, total } = await activityLogService.listActivityLogs(filters);

    return sendSuccess(res, {
      logs: items,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error: any) {
    console.error('Fetch activity logs failed:', error);
    return sendError(res, 'An error occurred while fetching activity logs.', 500);
  }
};

export const getActivityLogDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return sendError(res, 'Invalid activity log ID', 400);

    const log = await activityLogService.getActivityLogDetail(id);
    return sendSuccess(res, { log });
  } catch (error: any) {
    if (error.message.includes('not found')) return sendError(res, error.message, 404);
    console.error('Fetch activity log detail failed:', error);
    return sendError(res, 'An error occurred.', 500);
  }
};
