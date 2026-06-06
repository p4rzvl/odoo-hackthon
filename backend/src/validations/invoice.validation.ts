import { z } from 'zod';

export const createInvoiceSchema = z.object({
  poId: z.number({ message: 'Purchase Order ID must be a number' }).int().positive(),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required')
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
