"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useDatabase } from "@/hooks/use-database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/forms/transaction-form";
import { BudgetForm } from "@/components/forms/budget-form";
import { formatCurrency, formatMonth, formatDate } from "@/utils/formatters";
import { AIInsightsModal } from "@/components/dashboard/ai-insights-modal";
import PollWidget from "@/components/dashboard/poll-widget";
import { CATEGORY_PRESETS } from "@/utils/constants";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  PiggyBank,
} from "lucide-react";
import Link from "next/link";

// Dynamically import Recharts component to avoid SSR errors
const DashboardCharts = dynamic(
  () =>
    import("@/components/dashboard/dashboard-charts").then(
      (mod) => mod.DashboardCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] w-full bg-muted/20 animate-pulse rounded-xl" />
    ),
  },
);

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Summary Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="h-[100px] bg-muted/20 rounded-xl col-span-2 sm:col-span-1" />
        <div className="h-[100px] bg-muted/20 rounded-xl" />
        <div className="h-[100px] bg-muted/20 rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[400px] bg-muted/20 rounded-xl" />
          <div className="h-[300px] bg-muted/20 rounded-xl" />
        </div>
        
        {/* Side Panel Skeleton */}
        <div className="space-y-6">
          <div className="h-[350px] bg-muted/20 rounded-xl" />
          <div className="h-[250px] bg-muted/20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, transactions, budgets, activeMonth, setActiveMonth, isSyncing } =
    useDatabase();
  const currency = profile?.currency || "GHS";

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);

  // Filter transactions for active month
  const activeMonthTxs = transactions.filter(
    (t) => t.date.substring(0, 7) === activeMonth,
  );

  // Compute stats
  const totalIncome = activeMonthTxs
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = activeMonthTxs
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  // Month navigation controllers
  const handlePrevMonth = () => {
    const date = new Date(`${activeMonth}-01T12:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() - 1);
    setActiveMonth(date.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(`${activeMonth}-01T12:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + 1);
    setActiveMonth(date.toISOString().substring(0, 7));
  };

  // Generate monthly trend data for Area Chart (last 6 months relative to activeMonth)
  const monthlyChartData = Array.from({ length: 6 })
    .map((_, i) => {
      // Use activeMonth as the base so the graph shifts when the user navigates months
      const date = new Date(`${activeMonth}-01T12:00:00Z`);
      date.setUTCMonth(date.getUTCMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);
      const monthLabel = date.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      });

      const monthTxs = transactions.filter(
        (t) => t.date.substring(0, 7) === monthKey,
      );
      const inc = monthTxs
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const exp = monthTxs
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: monthLabel,
        income: parseFloat(inc.toFixed(2)),
        expense: parseFloat(exp.toFixed(2)),
      };
    })
    .reverse();

  // Generate category chart data for Pie Chart
  const categoryExpenses = activeMonthTxs
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const categoryChartData = Object.entries(categoryExpenses).map(
    ([category, amount]) => {
      const preset = CATEGORY_PRESETS.find((p) => p.label === category);
      return {
        name: category,
        value: parseFloat(amount.toFixed(2)),
        color: preset?.color || "#64748b",
      };
    },
  );

  // Budget progress items
  const budgetAlerts: string[] = [];
  const budgetProgress = budgets.map((b) => {
    const spent = activeMonthTxs
      .filter((t) => t.type === "expense" && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = b.limit_amount > 0 ? (spent / b.limit_amount) * 100 : 0;

    if (spent > b.limit_amount) {
      budgetAlerts.push(
        `You have exceeded your ${b.category} budget limit by ${formatCurrency(spent - b.limit_amount, currency)}!`,
      );
    } else if (percentage >= 85) {
      budgetAlerts.push(
        `Warning: You have used ${percentage.toFixed(0)}% of your ${b.category} budget.`,
      );
    }

    return {
      ...b,
      spent,
      percentage,
    };
  });

  // Recent transactions list
  const recentTxs = activeMonthTxs.slice(0, 5);

  // Calculate Previous Month Data for AI
  const prevDate = new Date(`${activeMonth}-01T12:00:00Z`);
  prevDate.setUTCMonth(prevDate.getUTCMonth() - 1);
  const prevMonthKey = prevDate.toISOString().substring(0, 7);

  const prevMonthTxs = transactions.filter(
    (t) => t.date.substring(0, 7) === prevMonthKey,
  );
  
  const prevTotalIncome = prevMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const prevTotalExpenses = prevMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const prevCategoryExpenses = prevMonthTxs
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

  const currentMonthData = {
    totalIncome,
    totalExpenses,
    netSavings,
    categoryExpenses,
    budgetProgress: budgetProgress.map(b => ({ category: b.category, spent: b.spent, limit: b.limit_amount })),
  };

  const previousMonthData = {
    totalIncome: prevTotalIncome,
    totalExpenses: prevTotalExpenses,
    netSavings: prevTotalIncome - prevTotalExpenses,
    categoryExpenses: prevCategoryExpenses,
  };

  return (
    <div className="space-y-6">
      {/* Header section with Month Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor your income, expenses, and budget limits.
          </p>
        </div>

        {/* Month controller */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
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

          <AIInsightsModal
            currentMonthData={currentMonthData}
            previousMonthData={previousMonthData}
            currency={currency}
          />

          {/* Quick Transaction Creation Action */}
          <Dialog open={isAddTxOpen} onOpenChange={setIsAddTxOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="flex items-center gap-1 shadow-sm font-semibold"
              >
                <Plus size={16} />
                <span>Log Transaction</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
              <DialogHeader>
                <DialogTitle>Log Transaction</DialogTitle>
                <DialogDescription>
                  Enter transaction details to update your balance.
                </DialogDescription>
              </DialogHeader>
              <TransactionForm onSuccess={() => setIsAddTxOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isSyncing ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Net Savings Card */}
        <Card className="border-border bg-card shadow-sm col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Net Savings
            </CardTitle>
            <div
              className={`p-1.5 rounded-lg ${netSavings >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
            >
              <PiggyBank size={16} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {formatCurrency(netSavings, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatMonth(activeMonth)}
            </p>
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Income
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={16} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {formatCurrency(totalIncome, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        {/* Total Expenses Card */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Expenses
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <TrendingDown size={16} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {formatCurrency(totalExpenses, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Warnings Panel */}
      {budgetAlerts.length > 0 && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>Budget Limit Alerts ({budgetAlerts.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-destructive-foreground/90 pl-1">
            {budgetAlerts.map((alert, i) => (
              <li key={i}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content Layout: Charts & side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Analytics Charts Component (Area and Pie) */}
        <DashboardCharts
          monthlyData={monthlyChartData}
          categoryData={categoryChartData}
          activeMonthLabel={formatMonth(activeMonth)}
        />

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Community Poll
              </CardTitle>
              <CardDescription>Quick feedback from users</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <PollWidget />
          </CardContent>
        </Card>

        {/* Budgets Tracker Card (Side Panel) */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Monthly Budgets
              </CardTitle>
              <CardDescription>Limit spent tracking</CardDescription>
            </div>
            <Dialog open={isSetBudgetOpen} onOpenChange={setIsSetBudgetOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 font-medium border-border"
                >
                  <Plus size={14} className="mr-1" /> Set Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
                <DialogHeader>
                  <DialogTitle>Set Budget Limit</DialogTitle>
                  <DialogDescription>
                    Set or update a monthly limit limit for a category.
                  </DialogDescription>
                </DialogHeader>
                <BudgetForm
                  month={activeMonth}
                  onSuccess={() => setIsSetBudgetOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetProgress.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <p>No budgets set for this month.</p>
                <p className="text-slate-500">
                  Configure category budgets to avoid overspending.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {budgetProgress.map((item) => {
                  const isOver = item.spent > item.limit_amount;
                  const isNear = item.percentage >= 85 && !isOver;

                  return (
                    <div key={item.id} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-foreground">{item.category}</span>
                        <span className="text-muted-foreground">
                          <span
                            className={`font-semibold ${isOver ? "text-destructive" : isNear ? "text-amber-500" : "text-foreground"}`}
                          >
                            {formatCurrency(item.spent, currency)}
                          </span>{" "}
                          / {formatCurrency(item.limit_amount, currency)}
                        </span>
                      </div>

                      {/* Budget Progress Bar */}
                      <div className="relative">
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isOver
                                ? "bg-destructive"
                                : isNear
                                  ? "bg-amber-500"
                                  : "bg-primary"
                            }`}
                            style={{
                              width: `${Math.min(item.percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Percent Tag */}
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{item.percentage.toFixed(0)}% spent</span>
                        {isOver ? (
                          <span className="text-destructive font-semibold">
                            Exceeded
                          </span>
                        ) : isNear ? (
                          <span className="text-amber-500 font-semibold">
                            Approaching Limit
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">
                            On Track
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions List Panel */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Last transactions logged this month
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="font-semibold" asChild>
            <Link href="/dashboard/transactions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {recentTxs.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No transactions logged for this month yet.
            </div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border/80 text-muted-foreground pb-2 font-medium">
                      <th className="py-2 pl-1">Title</th>
                      <th className="py-2">Category</th>
                      <th className="py-2">Date</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {recentTxs.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pl-1 font-semibold text-foreground max-w-[150px] truncate">
                          {tx.title}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {tx.category}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatDate(tx.date)}
                        </td>
                        <td
                          className={`py-3 text-right font-bold ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card List */}
              <div className="sm:hidden divide-y divide-border/40">
                {recentTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate max-w-[180px]">
                        {tx.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tx.category} · {formatDate(tx.date)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ml-3 shrink-0 ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
