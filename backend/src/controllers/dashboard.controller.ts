import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const metrics = await dashboardService.getDashboardMetrics(authReq.user.id);

    return sendSuccess(res, { metrics });
  } catch (error: any) {
    console.error('Dashboard metrics fetch failed:', error);
    return sendError(res, 'An error occurred while fetching dashboard metrics.', 500);
  }
};
