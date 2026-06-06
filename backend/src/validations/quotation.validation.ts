import { z } from 'zod';

export const createQuotationSchema = z.object({
  rfqId: z.number().int().positive('RFQ ID must be a positive integer'),
  gstPercent: z.number().min(0).max(100, 'GST must be between 0 and 100'),
  status: z.enum(['DRAFT', 'SUBMITTED']).default('DRAFT'),
  items: z
    .array(
      z.object({
        rfqLineItemId: z.number().int().positive(),
        unitPrice: z.number().nonnegative('Unit price cannot be negative'),
        deliveryDays: z.number().int().nonnegative('Delivery days cannot be negative')
      })
    )
    .min(1, 'At least one bidding line item is required')
});

export const updateQuotationSchema = z.object({
  gstPercent: z.number().min(0).max(100).optional(),
  status: z.enum(['DRAFT', 'SUBMITTED']).optional(),
  items: z
    .array(
      z.object({
        id: z.number().optional(),
        rfqLineItemId: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
        deliveryDays: z.number().int().nonnegative()
      })
    )
    .optional()
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
