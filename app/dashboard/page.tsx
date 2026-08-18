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
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
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
      <div className="h-[340px] w-full bg-muted/30 animate-pulse rounded-lg" />
    ),
  },
);

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 bg-muted/30 rounded-lg" />
        <div className="h-24 bg-muted/30 rounded-lg" />
        <div className="h-24 bg-muted/30 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 bg-muted/30 rounded-lg" />
          <div className="h-64 bg-muted/30 rounded-lg" />
        </div>
        <div className="space-y-6">
          <div className="h-80 bg-muted/30 rounded-lg" />
          <div className="h-48 bg-muted/30 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const {
    profile,
    transactions,
    budgets,
    activeMonth,
    setActiveMonth,
    isSyncing,
  } = useDatabase();
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
        `${b.category} budget exceeded by ${formatCurrency(spent - b.limit_amount, currency)}.`,
      );
    } else if (percentage >= 85) {
      budgetAlerts.push(
        `${b.category} budget at ${percentage.toFixed(0)}% of limit.`,
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

  const prevTotalIncome = prevMonthTxs
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const prevTotalExpenses = prevMonthTxs
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const prevCategoryExpenses = prevMonthTxs
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const currentMonthData = {
    totalIncome,
    totalExpenses,
    netSavings,
    categoryExpenses,
    budgetProgress: budgetProgress.map((b) => ({
      category: b.category,
      spent: b.spent,
      limit: b.limit_amount,
    })),
  };

  const previousMonthData = {
    totalIncome: prevTotalIncome,
    totalExpenses: prevTotalExpenses,
    netSavings: prevTotalIncome - prevTotalExpenses,
    categoryExpenses: prevCategoryExpenses,
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header section with Month Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 animate-stagger-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Financial Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
            Summary of cash flow, category budgets, and recent activity.
          </p>
        </div>

        {/* Month controller & Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
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
                className="h-8 gap-1.5 text-xs font-medium"
              >
                <Plus size={14} />
                <span>Log Transaction</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Log Transaction</DialogTitle>
                <DialogDescription className="text-xs">
                  Record an incoming revenue or expense payment.
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
          {/* Three Main Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger-2">
            {/* Total Income Card */}
            <Card className="border-border bg-card transition-colors duration-150">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Income
                </span>
                <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                  {formatCurrency(totalIncome, currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-normal">
                  Recorded in {formatMonth(activeMonth)}
                </p>
              </CardContent>
            </Card>

            {/* Total Expenses Card */}
            <Card className="border-border bg-card transition-colors duration-150">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Expenses
                </span>
                <TrendingDown size={15} className="text-rose-600 dark:text-rose-400" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                  {formatCurrency(totalExpenses, currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-normal">
                  Recorded in {formatMonth(activeMonth)}
                </p>
              </CardContent>
            </Card>

            {/* Net Savings Card */}
            <Card className="border-border bg-card transition-colors duration-150">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Net Savings
                </span>
                <Wallet size={15} className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div
                  className={`text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums ${
                    netSavings >= 0 ? "text-foreground" : "text-destructive"
                  }`}
                >
                  {formatCurrency(netSavings, currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-normal">
                  Net balance for period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Warnings Alert */}
          {budgetAlerts.length > 0 && (
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300 animate-stagger-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Budget Threshold Alerts</span>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground font-normal">
                  {budgetAlerts.map((alert, i) => (
                    <li key={i}>{alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Main 2-Column Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger-3">
            {/* Left Column (2/3): Analytics Charts & Recent Transactions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Analytics Charts Component */}
              <DashboardCharts
                monthlyData={monthlyChartData}
                categoryData={categoryChartData}
                activeMonthLabel={formatMonth(activeMonth)}
              />

              {/* Recent Transactions Panel */}
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-4 border-b border-border/60">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Recent Transactions
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Latest payments logged this month
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-medium"
                    asChild
                  >
                    <Link href="/dashboard/transactions">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {recentTxs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground font-normal">
                      No transactions recorded for {formatMonth(activeMonth)}.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-medium">
                            <th className="py-2.5 px-4">Title</th>
                            <th className="py-2.5 px-4">Category</th>
                            <th className="py-2.5 px-4">Date</th>
                            <th className="py-2.5 px-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {recentTxs.map((tx) => (
                            <tr
                              key={tx.id}
                              className="hover:bg-muted/20 transition-colors duration-150"
                            >
                              <td className="py-2.5 px-4 font-medium text-foreground max-w-[180px] truncate">
                                {tx.title}
                              </td>
                              <td className="py-2.5 px-4 text-muted-foreground font-normal">
                                {tx.category}
                              </td>
                              <td className="py-2.5 px-4 text-muted-foreground font-normal">
                                {formatDate(tx.date)}
                              </td>
                              <td
                                className={`py-2.5 px-4 text-right font-medium tabular-nums ${
                                  tx.type === "income"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-foreground"
                                }`}
                              >
                                {tx.type === "income" ? "+" : "-"}
                                {formatCurrency(tx.amount, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (1/3): Category Budgets & Feedback */}
            <div className="space-y-6">
              {/* Budgets Tracker Card */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 px-4 pt-4 flex flex-row items-center justify-between border-b border-border/60">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Monthly Budgets
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Spending targets for {formatMonth(activeMonth)}
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isSetBudgetOpen}
                    onOpenChange={setIsSetBudgetOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-medium"
                      >
                        <Plus size={13} className="mr-1" /> Budget
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
                      <DialogHeader>
                        <DialogTitle className="text-base font-semibold">Set Category Budget</DialogTitle>
                        <DialogDescription className="text-xs">
                          Configure a monthly expenditure limit.
                        </DialogDescription>
                      </DialogHeader>
                      <BudgetForm
                        month={activeMonth}
                        onSuccess={() => setIsSetBudgetOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {budgetProgress.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">No budgets formulated</p>
                      <p className="text-xs text-muted-foreground/80 font-normal">
                        Set category targets to monitor utilization.
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
                              <span className="text-foreground">
                                {item.category}
                              </span>
                              <span className="text-muted-foreground tabular-nums">
                                <span
                                  className={
                                    isOver
                                      ? "text-destructive font-semibold"
                                      : isNear
                                      ? "text-amber-600 dark:text-amber-400 font-semibold"
                                      : "text-foreground font-semibold"
                                  }
                                >
                                  {formatCurrency(item.spent, currency)}
                                </span>{" "}
                                / {formatCurrency(item.limit_amount, currency)}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full transition-all duration-200 ease-out ${
                                  isOver
                                    ? "bg-destructive"
                                    : isNear
                                    ? "bg-amber-500"
                                    : "bg-foreground"
                                }`}
                                style={{
                                  width: `${Math.min(item.percentage, 100)}%`,
                                }}
                              />
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground font-normal">
                              <span>{item.percentage.toFixed(0)}% utilized</span>
                              {isOver ? (
                                <span className="text-destructive font-medium">
                                  Exceeded
                                </span>
                              ) : isNear ? (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  Warning (85%+)
                                </span>
                              ) : (
                                <span>
                                  {formatCurrency(Math.max(0, item.limit_amount - item.spent), currency)} left
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

              {/* Community Feedback Card */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2 px-4 pt-4 border-b border-border/60">
                  <CardTitle className="text-sm font-semibold">
                    Product Poll
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Feedback for feature development
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <PollWidget />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
