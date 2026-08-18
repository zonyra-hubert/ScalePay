import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name must be under 50 characters'),
  avatar_url: z
    .string()
    .trim()
    .url('Invalid URL format')
    .max(2048, 'URL too long')
    .or(z.literal(''))
    .optional(),
  currency: z.string().min(2).max(10, 'Select a valid currency'),
  theme: z.enum(['light', 'dark', 'system']),
  email_alerts: z.boolean(),
  monthly_summary: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128, 'Password cannot exceed 128 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password cannot exceed 128 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
