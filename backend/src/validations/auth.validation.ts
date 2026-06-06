import { z } from 'zod';
import { Role } from '@prisma/client';

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
  role: z
    .nativeEnum(Role, { message: 'Invalid user role' })
    .default(Role.OFFICER),
  phone: z
    .string()
    .optional(),
  country: z
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

