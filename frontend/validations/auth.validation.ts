import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .trim(),
  role: z
    .enum(['OFFICER', 'VENDOR', 'MANAGER'], {
      message: 'Please select a valid role'
    }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val.replace(/[-() ]/g, '')), {
      message: 'Phone number must be exactly 10 digits'
    }),
  country: z
    .string()
    .optional(),
  profilePhoto: z
    .string()
    .optional(),
  additionalInfo: z
    .string()
    .optional()
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
