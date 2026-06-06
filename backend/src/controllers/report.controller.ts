import { Request, Response } from 'express';
import * as reportService from '../services/report.service';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';

export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const month = req.query.month as string;
    const data = await reportService.getOverview(authReq.user.role as Role, month);
    return sendSuccess(res, { overview: data });
  } catch (error: any) {
    console.error('Report overview failed:', error);
    return sendError(res, 'An error occurred while fetching report data.', 500);
  }
};

export const getSpendTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const month = req.query.month as string;
    const data = await reportService.getSpendTrend(authReq.user.role as Role, month);
    return sendSuccess(res, { trend: data });
  } catch (error: any) {
    console.error('Spend trend failed:', error);
    return sendError(res, 'An error occurred.', 500);
  }
};

export const getSpendByVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const data = await reportService.getSpendByVendor(authReq.user.role as Role);
    return sendSuccess(res, { vendors: data });
  } catch (error: any) {
    console.error('Vendor spend failed:', error);
    return sendError(res, 'An error occurred.', 500);
  }
};

export const exportCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return sendError(res, 'Authentication credentials missing', 401);

    const data = await reportService.getCsvData(authReq.user.role as Role);
    if (data.length === 0) {
      res.status(404).json({ success: false, error: 'No data available for export' });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvLines = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = (row as any)[h]?.toString() ?? '';
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))
    ];
    const csv = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="vendorbridge-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error: any) {
    console.error('CSV export failed:', error);
    res.status(500).json({ success: false, error: 'An error occurred during export.' });
  }
};
