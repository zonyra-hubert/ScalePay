/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { useDatabase } from '@/hooks/use-database';

interface ChartDataPoint {
  name: string;
  income: number;
  expense: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  monthlyData: ChartDataPoint[];
  categoryData: CategoryDataPoint[];
  activeMonthLabel: string;
}

// Clean, high-contrast tooltips for financial analytics
const CustomTooltipArea = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border px-3 py-2 rounded-md shadow-xs text-xs space-y-1 animate-in fade-in-0 zoom-in-95 duration-100">
        <p className="font-semibold text-foreground border-b border-border/60 pb-1 mb-1.5">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {formatCurrency(entry.value, currency)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomTooltipPie = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-popover border border-border px-3 py-2 rounded-md shadow-xs text-xs flex items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-100">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.payload.color }}
          />
          {entry.name}
        </span>
        <span className="font-semibold text-foreground tabular-nums">
          {formatCurrency(entry.value, currency)}
        </span>
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ monthlyData, categoryData, activeMonthLabel }: DashboardChartsProps) {
  const { profile } = useDatabase();
  const currency = profile?.currency || 'GHS';
  const [activeTab, setActiveTab] = useState<'trends' | 'categories'>('trends');

  return (
    <Card className="col-span-1 lg:col-span-2 border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-semibold">Cash Flow Analysis</CardTitle>
          <CardDescription className="text-xs mt-0.5">
            {activeTab === 'trends'
              ? 'Multi-month income and expenditure trends'
              : `Expense breakdown by category for ${activeMonthLabel}`}
          </CardDescription>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex bg-muted p-0.5 rounded-md border border-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-[background-color,color] duration-150 cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cash Flow Trends
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-[background-color,color] duration-150 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Category Distribution
          </button>
        </div>
      </CardHeader>

      <CardContent className="h-[300px] sm:h-[340px] w-full pt-4 pr-4">
        {activeTab === 'trends' ? (
          monthlyData.every(d => d.income === 0 && d.expense === 0) ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center">
              <p className="text-xs text-muted-foreground">No financial data available for trend analysis.</p>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">Log income and expenses to populate analytics.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" className="stroke-border/40" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const symbol = currency === 'GHS' ? '₵' : '$';
                    return `${symbol}${value}`;
                  }}
                />
                <Tooltip content={<CustomTooltipArea currency={currency} />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#16a34a"
                  strokeWidth={1.8}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="income"
                  animationDuration={300}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#dc2626"
                  strokeWidth={1.8}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="expense"
                  animationDuration={300}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : (
          categoryData.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center">
              <p className="text-xs text-muted-foreground">No expenses recorded for this month.</p>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">Log category expenses to see distribution.</p>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="h-[200px] w-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                  <PieChart>
                    <Tooltip content={<CustomTooltipPie currency={currency} />} />
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={300}
                      animationEasing="ease-out"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card)" strokeWidth={1.5} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 max-w-md">
                {categoryData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs border-b border-border/40 pb-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="truncate max-w-[90px]">{entry.name}</span>
                    </span>
                    <span className="font-semibold text-foreground ml-2 tabular-nums">
                      {formatCurrency(entry.value, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
