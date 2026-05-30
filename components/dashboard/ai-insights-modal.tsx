"use client";

import React, { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface AIInsightsModalProps {
  currentMonthData: any;
  previousMonthData: any;
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

  const handleOpen = () => {
    setIsOpen(true);
    if (!completion && !isLoading) {
      complete("", {
        body: { currentMonthData, previousMonthData, currency },
      });
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border-indigo-500/20 text-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
      >
        <Sparkles size={16} className="text-indigo-500" />
        Get AI Insights ✨
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="text-indigo-500" />
              ScalePay AI Advisor
            </DialogTitle>
            <DialogDescription>
              Personalized financial insights based on your recent activity.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {isLoading && !completion ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
                <p>Analyzing your finances...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm mt-1">
                  {error.message || "Please check your API key and try again."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    complete("", {
                      body: { currentMonthData, previousMonthData, currency },
                    })
                  }
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                <ReactMarkdown>{completion}</ReactMarkdown>

                {isLoading && (
                  <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse" />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
