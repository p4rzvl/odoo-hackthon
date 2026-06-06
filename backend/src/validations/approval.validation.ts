import { z } from 'zod';

export const approvalActionSchema = z.object({
  remarks: z
    .string()
    .min(1, 'Remarks are required for this action')
    .max(500, 'Remarks must not exceed 500 characters')
    .trim()
});

export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;
