import { z } from 'zod';

export const createRfqSchema = z.object({
  title: z
    .string()
    .min(1, 'RFQ title is required')
    .trim(),
  category: z
    .string()
    .min(1, 'RFQ category is required')
    .trim(),
  description: z
    .string()
    .min(1, 'RFQ description is required')
    .trim(),
  deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO datetime string' })
    .refine((val) => new Date(val) > new Date(), {
      message: 'Deadline must be in the future'
    }),
  lineItems: z
    .array(
      z.object({
        itemName: z.string().min(1, 'Item name is required').trim(),
        quantity: z.number().positive('Quantity must be greater than zero'),
        unit: z.string().min(1, 'Unit of measure is required').trim()
      })
    )
    .min(1, 'At least one line item is required'),
  assignedVendorIds: z
    .array(z.number())
    .min(1, 'At least one vendor must be invited'),
  attachments: z
    .array(
      z.object({
        fileName: z.string().min(1),
        filePath: z.string().min(1)
      })
    )
    .optional()
});

export const updateRfqSchema = z.object({
  title: z.string().min(1, 'RFQ title is required').trim().optional(),
  category: z.string().min(1, 'RFQ category is required').trim().optional(),
  description: z.string().min(1, 'RFQ description is required').trim().optional(),
  deadline: z
    .string()
    .datetime()
    .refine((val) => new Date(val) > new Date(), {
      message: 'Deadline must be in the future'
    })
    .optional(),
  lineItems: z
    .array(
      z.object({
        id: z.number().optional(), // optional ID for updating existing line items
        itemName: z.string().min(1).trim(),
        quantity: z.number().positive(),
        unit: z.string().min(1).trim()
      })
    )
    .optional(),
  assignedVendorIds: z.array(z.number()).optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string().min(1),
        filePath: z.string().min(1)
      })
    )
    .optional()
});

export type CreateRfqInput = z.infer<typeof createRfqSchema> & {
  attachments?: { fileName: string; filePath: string }[];
};
export type UpdateRfqInput = z.infer<typeof updateRfqSchema> & {
  attachments?: { fileName: string; filePath: string }[];
};

