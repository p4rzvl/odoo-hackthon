import { Request, Response } from 'express';
import * as rfqService from '../services/rfq.service';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';
import { CreateRfqInput, UpdateRfqInput } from '../validations/rfq.validation';

export const getRfqs = async (req: Request, res: Response): Promise<void> => {
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

    const { items, total } = await rfqService.listRfqs(authReq.user, filters);
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    return sendSuccess(res, {
      rfqs: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Fetch RFQs failed:', error);
    return sendError(res, 'An error occurred while fetching RFQs.', 500);
  }
};

export const getRfqById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid RFQ ID parameter', 400);
    }

    const rfq = await rfqService.getRfqDetail(id, authReq.user);
    return sendSuccess(res, { rfq });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('denied')) {
      const code = error.message.includes('denied') ? 403 : 404;
      return sendError(res, error.message, code);
    }
    console.error('Fetch RFQ details failed:', error);
    return sendError(res, 'An error occurred while fetching RFQ details.', 500);
  }
};

export const createRfq = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const data = req.body as CreateRfqInput;
    const rfq = await rfqService.createNewRfq(authReq.user.id, data);
    return sendSuccess(res, { rfq }, 201);
  } catch (error: any) {
    if (error.message.includes('found') || error.message.includes('blocked')) {
      return sendError(res, error.message, 400);
    }
    console.error('RFQ creation failed:', error);
    return sendError(res, 'An error occurred during RFQ creation.', 500);
  }
};

export const updateRfq = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid RFQ ID parameter', 400);
    }

    const data = req.body as UpdateRfqInput;
    const rfq = await rfqService.updateExistingRfq(id, authReq.user.id, data);
    return sendSuccess(res, { rfq });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('denied') || error.message.includes('Forbidden')) {
      return sendError(res, error.message, 403);
    }
    if (error.message.includes('found') || error.message.includes('blocked')) {
      return sendError(res, error.message, 400);
    }
    console.error('RFQ update failed:', error);
    return sendError(res, 'An error occurred while updating RFQ.', 500);
  }
};

export const publishRfq = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid RFQ ID parameter', 400);
    }

    const rfq = await rfqService.publishRfq(id, authReq.user.id);
    return sendSuccess(res, { rfq }, 200);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('denied')) {
      return sendError(res, error.message, 403);
    }
    if (error.message.includes('published') || error.message.includes('closed')) {
      return sendError(res, error.message, 400);
    }
    console.error('Publish RFQ failed:', error);
    return sendError(res, 'An error occurred while publishing RFQ.', 500);
  }
};
