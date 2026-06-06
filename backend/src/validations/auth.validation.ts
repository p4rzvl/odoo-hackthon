import { z } from 'zod';

// Roles allowed via public self-registration.
// ADMIN is intentionally excluded — Admin accounts are created only via seed script.
const PUBLIC_ROLES = ['OFFICER', 'VENDOR', 'MANAGER'] as const;

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
    .min(1, 'First name cannot be empty')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .trim(),
  // ADMIN role is forbidden — Zod rejects it before controller is reached
  role: z
    .enum(PUBLIC_ROLES, {
      message: 'Forbidden: Admin accounts cannot be self-registered. Choose OFFICER, VENDOR, or MANAGER.'
    })
    .default('OFFICER'),
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

