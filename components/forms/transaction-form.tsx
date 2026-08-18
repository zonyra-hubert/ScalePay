/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormValues } from '@/schemas/transaction-schema';
import { useDatabase } from '@/hooks/use-database';
import { Transaction } from '@/types';
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
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2 } from 'lucide-react';
import { CATEGORY_PRESETS } from '@/utils/constants';

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess: () => void;
  defaultType?: 'income' | 'expense';
}

export function TransactionForm({ transaction, onSuccess, defaultType = 'expense' }: TransactionFormProps) {
  const { profile, addTransaction, editTransaction } = useDatabase();
  const currency = profile?.currency || 'GHS';
  const isEditing = !!transaction;
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: transaction ? {
      title: transaction.title,
      amount: transaction.amount as any,
      date: transaction.date,
      category: transaction.category,
      type: transaction.type,
      description: transaction.description || '',
    } : {
      title: '',
      amount: '' as any,
      date: new Date().toISOString().split('T')[0],
      category: '',
      type: defaultType,
      description: '',
    },
  });

  const transactionType = useWatch({
    control,
    name: 'type',
    defaultValue: transaction ? transaction.type : defaultType,
  });

  // Load values when editing
  useEffect(() => {
    if (transaction) {
      reset({
        title: transaction.title,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category,
        type: transaction.type,
        description: transaction.description || '',
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (values: TransactionFormValues) => {
    setSaveError(null);
    try {
      if (isEditing && transaction) {
        await editTransaction(transaction.id, values);
      } else {
        await addTransaction(values);
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save transaction.';
      setSaveError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg border border-border/50">
        <button
          type="button"
          onClick={() => setValue('type', 'expense')}
          className={`py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
            transactionType === 'expense'
              ? 'bg-destructive text-destructive-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setValue('type', 'income')}
          className={`py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
            transactionType === 'income'
              ? 'bg-success text-success-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
          }`}
        >
          Income
        </button>
      </div>

      {/* Title Field */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Grocery shopping, Salary payment"
          {...register('title')}
          className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Amount and Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount ({currency})</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount')}
            className={errors.amount ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Date</Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a date"
                disableFuture={false}
                className={errors.date ? 'border-destructive' : ''}
              />
            )}
          />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <SelectTrigger
                id="category"
                className={errors.category ? 'border-destructive focus-visible:ring-destructive' : ''}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_PRESETS.map((cat) => (
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
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Add extra notes..."
          {...register('description')}
          className={errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        {saveError && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {saveError}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant={transactionType === 'income' ? 'default' : 'default'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Update Transaction'
            ) : (
              'Add Transaction'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
