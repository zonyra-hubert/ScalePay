import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be under 50 characters'),
  avatar_url: z
    .string()
    .url('Invalid URL format')
    .or(z.literal(''))
    .optional(),
  currency: z.string().min(3, 'Select a valid currency'),
  theme: z.enum(['light', 'dark', 'system']),
  email_alerts: z.boolean(),
  monthly_summary: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
