import { Request, Response } from 'express';
import * as approvalService from '../services/approval.service';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';

export const listApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const status = req.query.status as string | undefined;
    const approvals = await approvalService.listApprovals(authReq.user.id, status);

    return sendSuccess(res, { approvals });
  } catch (error: any) {
    console.error('Fetch approvals failed:', error);
    return sendError(res, 'An error occurred while fetching approvals.', 500);
  }
};

export const getApprovalDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid Approval ID parameter', 400);
    }

    const approval = await approvalService.getApprovalDetail(id, authReq.user.id);
    return sendSuccess(res, { approval });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('denied')) {
      return sendError(res, error.message, 403);
    }
    console.error('Fetch approval detail failed:', error);
    return sendError(res, 'An error occurred while fetching approval details.', 500);
  }
};

export const approveApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid Approval ID parameter', 400);
    }

    const { remarks } = req.body;
    if (!remarks || typeof remarks !== 'string' || remarks.trim().length === 0) {
      return sendError(res, 'Remarks are required for approval action', 400);
    }

    const result = await approvalService.approveApproval(authReq.user.id, id, remarks.trim());
    return sendSuccess(res, result);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('denied') || error.message.includes('authorized')) {
      return sendError(res, error.message, 403);
    }
    if (error.message.includes('Forbidden') || error.message.includes('already')) {
      return sendError(res, error.message, 400);
    }
    console.error('Approve approval failed:', error);
    return sendError(res, 'An error occurred while processing approval.', 500);
  }
};

export const rejectApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid Approval ID parameter', 400);
    }

    const { remarks } = req.body;
    if (!remarks || typeof remarks !== 'string' || remarks.trim().length === 0) {
      return sendError(res, 'Remarks are required for rejection action', 400);
    }

    const result = await approvalService.rejectApproval(authReq.user.id, id, remarks.trim());
    return sendSuccess(res, result);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('denied') || error.message.includes('authorized')) {
      return sendError(res, error.message, 403);
    }
    if (error.message.includes('Forbidden') || error.message.includes('already')) {
      return sendError(res, error.message, 400);
    }
    console.error('Reject approval failed:', error);
    return sendError(res, 'An error occurred while rejecting approval.', 500);
  }
};
