import { Request, Response } from 'express';
import * as invoiceService from '../services/invoice.service';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const { poId, invoiceDate, dueDate } = req.body;
    const invoice = await invoiceService.createInvoiceFromPo(
      authReq.user.id,
      poId,
      new Date(invoiceDate),
      new Date(dueDate)
    );
    return sendSuccess(res, { invoice });
  } catch (error: any) {
    if (error.message.includes('not found')) return sendError(res, error.message, 404);
    if (error.message.includes('must be APPROVED')) return sendError(res, error.message, 400);
    if (error.message.includes('already been generated')) return sendError(res, error.message, 409);
    console.error('Create Invoice failed:', error);
    return sendError(res, 'An error occurred while creating the invoice.', 500);
  }
};

export const listInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const filters = {
      status: req.query.status as string,
      page: parseInt(req.query.page as string || '1', 10),
      limit: parseInt(req.query.limit as string || '20', 10)
    };

    const { items, total } = await invoiceService.listInvoices(filters);

    return sendSuccess(res, {
      invoices: items,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error: any) {
    console.error('Fetch Invoices failed:', error);
    return sendError(res, 'An error occurred while fetching invoices.', 500);
  }
};

export const getInvoiceDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return sendError(res, 'Invalid Invoice ID parameter', 400);

    const invoice = await invoiceService.getInvoiceDetail(id);
    return sendSuccess(res, { invoice });
  } catch (error: any) {
    if (error.message.includes('not found')) return sendError(res, error.message, 404);
    console.error('Fetch Invoice detail failed:', error);
    return sendError(res, 'An error occurred while fetching invoice details.', 500);
  }
};

export const markInvoiceAsPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return sendError(res, 'Invalid Invoice ID parameter', 400);

    const { paidRemarks } = req.body;
    const invoice = await invoiceService.markInvoiceAsPaid(authReq.user.id, id, paidRemarks);
    return sendSuccess(res, { invoice });
  } catch (error: any) {
    if (error.message.includes('not found')) return sendError(res, error.message, 404);
    if (error.message.includes('already')) return sendError(res, error.message, 400);
    console.error('Mark Invoice paid failed:', error);
    return sendError(res, 'An error occurred while marking invoice as paid.', 500);
  }
};
