import { z } from 'zod';

export const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  description: z.string().max(300, 'Description must be under 300 characters').optional().or(z.literal('')),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit_amount: z.coerce.number().positive('Budget limit must be greater than 0'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;
