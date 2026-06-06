import { Request, Response } from 'express';
import * as quotationService from '../services/quotation.service';
import * as quotationRepository from '../repositories/quotation.repository';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';
import { CreateQuotationInput, UpdateQuotationInput } from '../validations/quotation.validation';

export const listQuotations = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const rfqId = req.query.rfqId ? parseInt(req.query.rfqId as string, 10) : undefined;
    
    // Resolve vendorId filter: Vendors can only view their own quotes
    let vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string, 10) : undefined;
    if (authReq.user.role === 'VENDOR') {
      const vendor = await prisma?.vendor.findUnique({ where: { userId: authReq.user.id } });
      if (!vendor) {
        return sendError(res, 'Supplier profile not found', 404);
      }
      vendorId = vendor.id;
    }

    const status = req.query.status as string;

    const items = await quotationRepository.listQuotations({
      rfqId: rfqId && !isNaN(rfqId) ? rfqId : undefined,
      vendorId: vendorId && !isNaN(vendorId) ? vendorId : undefined,
      status
    });

    return sendSuccess(res, { quotations: items });
  } catch (error: any) {
    console.error('Fetch quotations failed:', error);
    return sendError(res, 'An error occurred while retrieving quotations.', 500);
  }
};

export const getQuotationDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid Quotation ID parameter', 400);
    }

    const quotation = await quotationRepository.getQuotationById(id);
    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }

    // Role-based auth verification
    if (authReq.user.role === 'VENDOR') {
      const vendor = await prisma?.vendor.findUnique({ where: { userId: authReq.user.id } });
      if (!vendor || quotation.vendorId !== vendor.id) {
        return sendError(res, 'Access denied: You are not authorized to view this quotation.', 403);
      }
    }

    return sendSuccess(res, { quotation });
  } catch (error: any) {
    console.error('Fetch quotation details failed:', error);
    return sendError(res, 'An error occurred while retrieving quotation details.', 500);
  }
};

export const createQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const data = req.body as CreateQuotationInput;
    const quotation = await quotationService.submitNewQuotation(authReq.user.id, data);
    return sendSuccess(res, { quotation }, 201);
  } catch (error: any) {
    console.error('Submit quotation failed:', error);
    return sendError(res, error.message || 'An error occurred while submitting quotation.', 400);
  }
};

export const updateQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid Quotation ID parameter', 400);
    }

    const data = req.body as UpdateQuotationInput;
    const quotation = await quotationService.updateQuotationDraft(authReq.user.id, id, data);
    return sendSuccess(res, { quotation });
  } catch (error: any) {
    console.error('Update quotation failed:', error);
    return sendError(res, error.message || 'An error occurred while updating quotation.', 400);
  }
};

export const selectQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return sendError(res, 'Authentication credentials missing', 401);
    }

    const rfqId = parseInt(req.params.rfqId as string, 10);
    const quotationId = parseInt(req.body.quotationId as string, 10);
    
    if (isNaN(rfqId) || isNaN(quotationId)) {
      return sendError(res, 'Invalid RFQ ID or Quotation ID parameter', 400);
    }

    const quotation = await quotationService.selectQuotationForApproval(authReq.user.id, rfqId, quotationId);
    return sendSuccess(res, { quotation });
  } catch (error: any) {
    console.error('Select quotation failed:', error);
    return sendError(res, error.message || 'An error occurred while selecting quotation.', 400);
  }
};

import prisma from '../lib/prisma';
