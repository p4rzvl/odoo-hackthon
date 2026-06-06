import { Request, Response } from 'express';
import * as poService from '../services/purchaseOrder.service';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';

export const listPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const filters = {
      status: req.query.status as string,
      page: req.query.page as string,
      limit: req.query.limit as string
    };

    const { items, total } = await poService.listPurchaseOrders(authReq.user, filters);
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    return sendSuccess(res, {
      purchaseOrders: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Fetch Purchase Orders failed:', error);
    return sendError(res, 'An error occurred while fetching Purchase Orders.', 500);
  }
};

export const getPurchaseOrderDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid Purchase Order ID parameter', 400);
    }

    const po = await poService.getPurchaseOrderDetail(id, authReq.user);
    return sendSuccess(res, { purchaseOrder: po });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('denied')) {
      return sendError(res, error.message, 403);
    }
    console.error('Fetch Purchase Order detail failed:', error);
    return sendError(res, 'An error occurred while fetching Purchase Order details.', 500);
  }
};

export const updatePoStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid Purchase Order ID parameter', 400);
    }

    const { status } = req.body;
    const po = await poService.updatePoStatus(id, authReq.user.id, status);
    return sendSuccess(res, { purchaseOrder: po });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    console.error('Update PO status failed:', error);
    return sendError(res, 'An error occurred while updating Purchase Order status.', 500);
  }
};
