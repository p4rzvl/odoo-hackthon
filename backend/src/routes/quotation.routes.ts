import { Router } from 'express';
import { listQuotations, getQuotationDetail, createQuotation, updateQuotation } from '../controllers/quotation.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validateBody } from '../middleware/validate';
import { createQuotationSchema, updateQuotationSchema } from '../validations/quotation.validation';

const router = Router();

// Retrieve quotations list
router.get(
  '/', 
  authenticateToken, 
  requireRole(['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR']), 
  listQuotations
);

// Retrieve single quotation detail
router.get(
  '/:id', 
  authenticateToken, 
  requireRole(['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR']), 
  getQuotationDetail
);

// Submit a quotation bid
router.post(
  '/', 
  authenticateToken, 
  requireRole(['VENDOR']), 
  validateBody(createQuotationSchema), 
  createQuotation
);

// Update a draft quotation bid
router.put(
  '/:id', 
  authenticateToken, 
  requireRole(['VENDOR']), 
  validateBody(updateQuotationSchema), 
  updateQuotation
);

export default router;
