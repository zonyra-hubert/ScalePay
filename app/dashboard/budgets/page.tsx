"use client";

import React, { useState } from 'react';
import { useDatabase } from '@/hooks/use-database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BudgetForm } from '@/components/forms/budget-form';
import { formatCurrency, formatMonth } from '@/utils/formatters';
import { CATEGORY_PRESETS } from '@/utils/constants';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function BudgetsPage() {
  const {
    profile,
    transactions,
    budgets,
    activeMonth,
    setActiveMonth,
    updateBudget,
  } = useDatabase();
  const currency = profile?.currency || 'GHS';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{ category: string; limit_amount: number } | null>(null);

  // Month navigation controllers
  const handlePrevMonth = () => {
    const [year, month] = activeMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setActiveMonth(date.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    const [year, month] = activeMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setActiveMonth(date.toISOString().substring(0, 7));
  };

  // Get active month's transactions
  const activeMonthTxs = transactions.filter((t) => t.date.substring(0, 7) === activeMonth);

  // Map budgets with spent data
  const budgetList = budgets.map((b) => {
    const spent = activeMonthTxs
      .filter((t) => t.type === 'expense' && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = b.limit_amount > 0 ? (spent / b.limit_amount) * 100 : 0;
    const remaining = Math.max(0, b.limit_amount - spent);

    return {
      ...b,
      spent,
      percentage,
      remaining,
    };
  });

  // Categories already budgeted
  const budgetedCategories = budgets.map((b) => b.category);
  const availableCategories = CATEGORY_PRESETS.filter(
    (cat) => cat.id !== 'salary' && !budgetedCategories.includes(cat.label)
  );

  const handleRemoveBudget = async (category: string) => {
    try {
      await updateBudget(category, undefined, activeMonth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header section with month controllers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 animate-stagger-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Category Budgets</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
            Set and monitor expenditure thresholds for {formatMonth(activeMonth)}.
          </p>
        </div>

        {/* Month Navigation & Add Budget */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-card border border-border rounded-md p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-semibold px-2.5 min-w-[90px] text-center select-none flex items-center gap-1.5 justify-center text-foreground">
              <Calendar size={12} className="text-muted-foreground" />
              {formatMonth(activeMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                disabled={availableCategories.length === 0}
                className="h-8 gap-1.5 text-xs font-medium"
              >
                <Plus size={14} />
                <span>Create Budget</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Create Category Budget</DialogTitle>
                <DialogDescription className="text-xs">
                  Set a monthly limit for a spending category.
                </DialogDescription>
              </DialogHeader>
              <BudgetForm month={activeMonth} onSuccess={() => setIsAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Grid View */}
      {budgetList.length === 0 ? (
        <Card className="border-border bg-card py-12 animate-stagger-2">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2.5 bg-muted rounded-full text-muted-foreground mb-1">
              <Wallet className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">No Budgets Configured</h3>
            <p className="text-xs text-muted-foreground max-w-sm font-normal">
              You have not configured any monthly budget targets for {formatMonth(activeMonth)}. Create one above to monitor your spending limits.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-stagger-2">
          {budgetList.map((item) => {
            const preset = CATEGORY_PRESETS.find((c) => c.label === item.category);
            const isExceeded = item.spent > item.limit_amount;
            const isWarning = item.percentage >= 85 && !isExceeded;

            return (
              <Card key={item.id} className="border-border bg-card flex flex-col justify-between transition-colors duration-150">
                <CardHeader className="pb-3 pt-4 px-4 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: preset?.color || '#94a3b8' }}
                      />
                      <CardTitle className="text-sm font-semibold">{item.category}</CardTitle>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() =>
                          setEditingBudget({
                            category: item.category,
                            limit_amount: item.limit_amount,
                          })
                        }
                        title="Adjust limit"
                      >
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        onClick={() => handleRemoveBudget(item.category)}
                        title="Delete budget"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3.5 flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-baseline">
                    <div className="space-y-0.5">
                      <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                        {formatCurrency(item.spent, currency)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1.5 font-normal">spent</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        Limit: {formatCurrency(item.limit_amount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ease-out ${
                          isExceeded
                            ? 'bg-destructive'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-foreground'
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs font-normal text-muted-foreground">
                      <span>{item.percentage.toFixed(0)}% utilized</span>
                      {isExceeded ? (
                        <span className="text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle size={11} /> Exceeded by {formatCurrency(item.spent - item.limit_amount, currency)}
                        </span>
                      ) : isWarning ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                          <AlertCircle size={11} /> {formatCurrency(item.remaining, currency)} remaining
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Check size={11} className="text-emerald-600 dark:text-emerald-400" /> {formatCurrency(item.remaining, currency)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Adjust Limit Dialog Modal */}
      <Dialog
        open={!!editingBudget}
        onOpenChange={(open) => !open && setEditingBudget(null)}
      >
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Adjust Budget Limit</DialogTitle>
            <DialogDescription className="text-xs">
              Modify the monthly limit for this category.
            </DialogDescription>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              category={editingBudget.category}
              limitAmount={editingBudget.limit_amount}
              month={activeMonth}
              onSuccess={() => setEditingBudget(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
