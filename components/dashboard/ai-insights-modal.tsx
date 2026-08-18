"use client";

import React, { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { LineChart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";

interface CategorySummary {
  [category: string]: number;
}

interface BudgetProgressSummary {
  category: string;
  spent: number;
  limit: number;
}

interface MonthDataSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  categoryExpenses?: CategorySummary;
  budgetProgress?: BudgetProgressSummary[];
}

interface AIInsightsModalProps {
  currentMonthData: MonthDataSummary;
  previousMonthData: MonthDataSummary;
  currency: string;
}

export function AIInsightsModal({
  currentMonthData,
  previousMonthData,
  currency,
}: AIInsightsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/advisor",
    streamProtocol: "text",
  });

  const handleOpen = async () => {
    setIsOpen(true);
    if (!completion && !isLoading) {
      let authToken = "";
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          authToken = session.access_token;
        }
      }

      complete("", {
        body: { currentMonthData, previousMonthData, currency },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
    }
  };

  const handleRetry = async () => {
    let authToken = "";
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        authToken = session.access_token;
      }
    }

    complete("", {
      body: { currentMonthData, previousMonthData, currency },
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs font-medium"
      >
        <LineChart className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Performance Analysis</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-base font-semibold">
              Monthly Cash Flow Analysis
            </DialogTitle>
            <DialogDescription className="text-xs">
              Automated comparison of income, expenditure variances, and budget adherence.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {isLoading && !completion ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-3 text-foreground" />
                <p className="text-xs font-medium">Computing financial report...</p>
              </div>
            ) : error ? (
              <div className="p-3.5 bg-destructive/10 text-destructive rounded-md border border-destructive/20 text-xs">
                <p className="font-semibold">Unable to generate financial report</p>
                <p className="text-[11px] mt-1 text-destructive/90">
                  {error.message || "Please check your network session and try again."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-xs h-7"
                  onClick={handleRetry}
                >
                  Retry Analysis
                </Button>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed prose-headings:font-semibold prose-headings:text-sm prose-p:my-2 prose-ul:my-2">
                <ReactMarkdown>{completion}</ReactMarkdown>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
