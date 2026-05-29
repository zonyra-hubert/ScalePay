/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema, BudgetFormValues } from '@/schemas/transaction-schema';
import { useDatabase } from '@/hooks/use-database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_PRESETS } from '@/utils/constants';

interface BudgetFormProps {
  category?: string;
  limitAmount?: number;
  month: string; // YYYY-MM
  onSuccess: () => void;
}

export function BudgetForm({ category = '', limitAmount, month, onSuccess }: BudgetFormProps) {
  const { profile, updateBudget } = useDatabase();
  const currency = profile?.currency || 'GHS';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      category,
      limit_amount: limitAmount || ('' as any),
      month,
    },
  });

  useEffect(() => {
    reset({
      category,
      limit_amount: limitAmount || undefined,
      month,
    });
  }, [category, limitAmount, month, reset]);

  const onSubmit = async (values: BudgetFormValues) => {
    try {
      await updateBudget(values.category, values.limit_amount, values.month);
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {/* Category Dropdown (disabled if we are editing a specific category's budget) */}
      <div className="space-y-1.5">
        <Label htmlFor="budget-category">Category</Label>
        {category ? (
          <div className="flex h-10 w-full items-center rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
            <span>{category}</span>
            <input type="hidden" value={category} {...register('category')} />
          </div>
        ) : (
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="budget-category"
                  className={errors.category ? 'border-destructive focus-visible:ring-destructive' : ''}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_PRESETS.filter(cat => cat.id !== 'salary').map((cat) => (
                    <SelectItem key={cat.id} value={cat.label} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Budget Limit Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="limit_amount">Monthly Limit ({currency})</Label>
        <Input
          id="limit_amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('limit_amount')}
          className={errors.limit_amount ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.limit_amount && (
          <p className="text-xs text-destructive">{errors.limit_amount.message}</p>
        )}
      </div>

      {/* Month Field (Hidden or read-only/disabled) */}
      <div className="space-y-1.5">
        <Label htmlFor="budget-month">Budget Period</Label>
        <Input
          id="budget-month"
          type="month"
          {...register('month')}
          className="bg-muted/50"
          readOnly
        />
        {errors.month && (
          <p className="text-xs text-destructive">{errors.month.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : category ? 'Update Budget' : 'Set Budget'}
        </Button>
      </div>
    </form>
  );
}
