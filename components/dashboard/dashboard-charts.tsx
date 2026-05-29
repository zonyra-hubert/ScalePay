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

// Custom tooltips declared outside of render to prevent recreation/performance warning
const CustomTooltipArea = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="font-bold text-foreground mb-1">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name === 'income' ? 'Income' : 'Expense'}
            </span>
            <span className="font-semibold text-foreground">
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
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-xs flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.payload.color }}
          />
          {entry.name}
        </span>
        <span className="font-bold text-foreground">
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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-base sm:text-lg">Analytics Overview</CardTitle>
          <CardDescription>
            {activeTab === 'trends'
              ? 'Multi-month income and expense trends'
              : `Expense distribution for ${activeMonthLabel}`}
          </CardDescription>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex bg-muted p-0.5 rounded-lg border border-border/50 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cash Flow Trends
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Category breakdown
          </button>
        </div>
      </CardHeader>

      <CardContent className="h-[300px] sm:h-[350px] w-full pr-4">
        {activeTab === 'trends' ? (
          monthlyData.every(d => d.income === 0 && d.expense === 0) ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">No financial data available for trends.</p>
              <p className="text-xs text-slate-500 mt-1">Add transactions to populate these charts.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const symbol = currency === 'GHS' ? '₵' : '$';
                    return `${symbol}${value}`;
                  }}
                />
                <Tooltip content={<CustomTooltipArea currency={currency} />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : (
          categoryData.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">No expenses recorded for this month.</p>
              <p className="text-xs text-slate-500 mt-1">Define expenses to see category breakdowns.</p>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="h-[220px] w-[220px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltipPie currency={currency} />} />
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2.5 max-w-md">
                {categoryData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs border-b border-border/40 pb-1">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="truncate max-w-[100px]">{entry.name}</span>
                    </span>
                    <span className="font-semibold text-foreground ml-2">
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
