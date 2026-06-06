import { z } from 'zod';

export const createVendorSchema = z.object({
  userId: z
    .number({ message: 'User ID mapping is required' }),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .trim(),
  gstNumber: z
    .string()
    .min(15, 'GSTIN must be exactly 15 characters')
    .max(15, 'GSTIN must be exactly 15 characters')
    .toUpperCase()
    .trim(),
  category: z
    .string()
    .min(1, 'Vendor category is required')
    .trim(),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .trim(),
  address: z
    .string()
    .min(1, 'Address is required')
    .trim()
});

export const updateVendorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').trim().optional(),
  gstNumber: z.string().min(15).max(15).toUpperCase().trim().optional(),
  category: z.string().min(1).trim().optional(),
  contactNumber: z.string().min(1).trim().optional(),
  address: z.string().min(1).trim().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'BLOCKED']).optional()
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
