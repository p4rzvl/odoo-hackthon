import { Router } from 'express';
import { getVendors, getVendorById, createVendor, updateVendor } from '../controllers/vendor.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validateBody } from '../middleware/validate';
import { createVendorSchema, updateVendorSchema } from '../validations/vendor.validation';

const router = Router();

// Retrieve directory listing (Managers and Officers can view)
router.get(
  '/', 
  authenticateToken, 
  requireRole(['ADMIN', 'MANAGER', 'OFFICER']), 
  getVendors
);

// Retrieve details of a single vendor profile (Managers, Officers, and mapped Vendors can view)
router.get(
  '/:id', 
  authenticateToken, 
  requireRole(['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR']), 
  getVendorById
);

// Onboard a new vendor (Officers and Admins only)
router.post(
  '/', 
  authenticateToken, 
  requireRole(['ADMIN', 'OFFICER']), 
  validateBody(createVendorSchema), 
  createVendor
);

// Update vendor details (Officers and Admins only)
router.patch(
  '/:id', 
  authenticateToken, 
  requireRole(['ADMIN', 'OFFICER']), 
  validateBody(updateVendorSchema), 
  updateVendor
);

export default router;
