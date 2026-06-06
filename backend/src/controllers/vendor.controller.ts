import { Request, Response } from 'express';
import * as vendorService from '../services/vendor.service';
import { sendSuccess, sendError } from '../lib/response';
import { CreateVendorInput, UpdateVendorInput } from '../validations/vendor.validation';

export const getVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      search: req.query.search as string,
      category: req.query.category as string,
      status: req.query.status as string,
      page: req.query.page as string,
      limit: req.query.limit as string
    };

    const { items, total } = await vendorService.listVendors(filters);
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    return sendSuccess(res, {
      vendors: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Fetch vendors failed:', error);
    return sendError(res, 'An error occurred while fetching vendors.', 500);
  }
};

export const getVendorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid vendor ID parameter', 400);
    }

    const vendor = await vendorService.getVendorDetail(id);
    return sendSuccess(res, { vendor });
  } catch (error: any) {
    if (error.message === 'Vendor not found') {
      return sendError(res, error.message, 404);
    }
    console.error('Fetch vendor detail failed:', error);
    return sendError(res, 'An error occurred while fetching vendor details.', 500);
  }
};

export const createVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as CreateVendorInput;
    const vendor = await vendorService.onboardVendor(data);
    return sendSuccess(res, { vendor }, 201);
  } catch (error: any) {
    if (
      error.message.includes('not found') || 
      error.message.includes('role') || 
      error.message.includes('mapped')
    ) {
      return sendError(res, error.message, 400);
    }
    console.error('Vendor onboarding failed:', error);
    return sendError(res, 'An error occurred during vendor onboarding.', 500);
  }
};

export const updateVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return sendError(res, 'Invalid vendor ID parameter', 400);
    }

    const data = req.body as UpdateVendorInput;
    const vendor = await vendorService.updateVendorProfile(id, data);
    return sendSuccess(res, { vendor });
  } catch (error: any) {
    if (error.message === 'Vendor not found') {
      return sendError(res, error.message, 404);
    }
    console.error('Update vendor profile failed:', error);
    return sendError(res, 'An error occurred while updating vendor profile.', 500);
  }
};
