import { z } from 'zod';

export const updatePoStatusSchema = z.object({
  status: z.enum(['DRAFT', 'APPROVED', 'FULFILLED'], {
    message: 'Status must be one of: DRAFT, APPROVED, FULFILLED'
  })
});

export type UpdatePoStatusInput = z.infer<typeof updatePoStatusSchema>;
