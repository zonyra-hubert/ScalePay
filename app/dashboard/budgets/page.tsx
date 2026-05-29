"use client";

import React, { useState } from 'react';
import { useDatabase } from '@/hooks/use-database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  AlertTriangle,
  CheckCircle,
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
  const currency = profile?.currency || 'USD';

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
  // Categories available for new budgets (excluding Salary / Income type categories)
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
    <div className="space-y-6">
      {/* Header section with month controllers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground text-sm">Allocate monthly spending targets for categories.</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="flex items-center bg-card border border-border rounded-lg p-1.5 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold px-3 min-w-[100px] text-center select-none flex items-center gap-1.5 justify-center">
              <Calendar size={13} className="text-primary" />
              {formatMonth(activeMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* New Budget Button (disabled if no category is left) */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                disabled={availableCategories.length === 0}
                className="flex items-center gap-1 shadow-sm font-semibold"
              >
                <Plus size={16} />
                <span>Create Budget</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Budget</DialogTitle>
                <DialogDescription>
                  Allocate a monthly limit limit for a spending category.
                </DialogDescription>
              </DialogHeader>
              <BudgetForm month={activeMonth} onSuccess={() => setIsAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Grid View */}
      {budgetList.length === 0 ? (
        <Card className="border-border bg-card shadow-sm py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Wallet className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Budgets Formulated</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                You haven&apos;t defined any budget limits for {formatMonth(activeMonth)} yet. Create one above to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetList.map((item) => {
            const preset = CATEGORY_PRESETS.find((c) => c.label === item.category);
            const isExceeded = item.spent > item.limit_amount;
            const isWarning = item.percentage >= 85 && !isExceeded;

            return (
              <Card key={item.id} className="border-border bg-card shadow-sm overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset?.color || '#94a3b8' }}
                      />
                      <CardTitle className="text-base font-bold">{item.category}</CardTitle>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() =>
                          setEditingBudget({
                            category: item.category,
                            limit_amount: item.limit_amount,
                          })
                        }
                        title="Adjust limit"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        onClick={() => handleRemoveBudget(item.category)}
                        title="Delete budget"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 flex-grow flex flex-col justify-between">
                  {/* Values */}
                  <div className="flex justify-between items-baseline">
                    <div className="space-y-0.5">
                      <span className="text-2xl font-extrabold tracking-tight">
                        {formatCurrency(item.spent, currency)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1.5">spent</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Limit: {formatCurrency(item.limit_amount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <Progress
                      value={Math.min(item.percentage, 100)}
                      className={
                        isExceeded
                          ? 'bg-destructive/10 border-destructive/20'
                          : isWarning
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : 'bg-primary/10'
                      }
                      // Note: shading uses standard theme coloring, but let's make sure class matches
                      style={{
                        backgroundColor: isExceeded ? '#ef4444' : isWarning ? '#f59e0b' : undefined,
                      }}
                    />
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                      <span>{item.percentage.toFixed(0)}% Utilized</span>
                      {isExceeded ? (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertTriangle size={12} /> Exceeded by {formatCurrency(item.spent - item.limit_amount, currency)}
                        </span>
                      ) : isWarning ? (
                        <span className="text-amber-500 flex items-center gap-1">
                          <AlertTriangle size={12} /> Approaching Limit ({formatCurrency(item.remaining, currency)} left)
                        </span>
                      ) : (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <CheckCircle size={12} /> On track ({formatCurrency(item.remaining, currency)} left)
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Budget Limit</DialogTitle>
            <DialogDescription>
              Modify the spending threshold limit for this category.
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
