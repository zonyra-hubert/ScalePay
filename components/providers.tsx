"use client";

import React, { createContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { getDatabaseProvider } from "@/lib/db-provider";
import { Profile, Transaction, Budget } from "@/types";
import { Toaster, toast } from "sonner";
import {
  NotificationProvider,
  useNotifications,
} from "@/components/providers/notification-provider";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils/formatters";

interface DatabaseContextType {
  isDemo: boolean;
  profile: Profile | null;
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  isSyncing: boolean;
  activeMonth: string; // YYYY-MM
  setActiveMonth: (month: string) => void;
  refreshTransactions: () => Promise<void>;
  refreshBudgets: (month: string) => Promise<void>;
  addTransaction: (
    data: Omit<Transaction, "id" | "user_id" | "created_at">,
  ) => Promise<void>;
  editTransaction: (
    id: string,
    data: Partial<Omit<Transaction, "id" | "user_id" | "created_at">>,
  ) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  updateBudget: (
    category: string,
    limit: number | undefined,
    month: string,
  ) => Promise<void>;
  updateProfile: (
    data: Partial<Omit<Profile, "id" | "email" | "created_at">>,
  ) => Promise<void>;
  logOut: () => Promise<void>;
}

export const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined,
);

// Lazy singleton — instantiated once on first use (avoids SSR/CSR mismatch)
let _db: ReturnType<typeof getDatabaseProvider> | null = null;
const getDb = () => {
  if (!_db) _db = getDatabaseProvider();
  return _db;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <NotificationProvider>
        <DatabaseProviderWrapper>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </DatabaseProviderWrapper>
      </NotificationProvider>
    </NextThemesProvider>
  );
}

function DatabaseProviderWrapper({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeMonth, setActiveMonth] = useState<string>(() => {
    return new Date().toISOString().substring(0, 7); // Default to current month
  });

  const { addNotification } = useNotifications();

  // Load user profile & initial transactions
  useEffect(() => {
    let active = true;

    async function loadData() {
      // If we don't have a profile yet, it's the initial load. Otherwise, it's a sync.
      if (!profile) {
        setLoading(true);
      } else {
        setIsSyncing(true);
      }

      try {
        const userProfile = await getDb().getProfile();
        if (!active) return;
        setProfile(userProfile);
        
        if (userProfile) {
          const txs = await getDb().getTransactions();
          if (!active) return;
          setTransactions(txs);
          
          const bgts = await getDb().getBudgets(activeMonth);
          if (!active) return;
          setBudgets(bgts);
        } else {
          setTransactions([]);
          setBudgets([]);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        if (active) {
          setLoading(false);
          setIsSyncing(false);
        }
      }
    }

    loadData();

    // Listen to Supabase auth state changes if Supabase is active
    if (!getDb().isDemoMode && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!active) return;

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          // Re-load profile and data
          const userProfile = await getDb().getProfile();
          if (!active) return;
          setProfile(userProfile);
          if (userProfile) {
            const txs = await getDb().getTransactions();
            if (!active) return;
            setTransactions(txs);
            const bgts = await getDb().getBudgets(activeMonth);
            if (!active) return;
            setBudgets(bgts);
          }
        } else if (event === "SIGNED_OUT") {
          setProfile(null);
          setTransactions([]);
          setBudgets([]);
        }
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      active = false;
    };
  }, [activeMonth]);

  const refreshTransactions = async () => {
    try {
      const txs = await getDb().getTransactions();
      setTransactions(txs);
    } catch (err) {
      console.error("Failed to refresh transactions:", err);
    }
  };

  const refreshBudgets = async (month: string) => {
    try {
      const bgts = await getDb().getBudgets(month);
      setBudgets(bgts);
    } catch (err) {
      console.error("Failed to refresh budgets:", err);
    }
  };

  const formatVal = (val: number) => {
    return formatCurrency(val, profile?.currency || "GHS");
  };

  const addTransaction = async (
    data: Omit<Transaction, "id" | "user_id" | "created_at">,
  ) => {
    try {
      await getDb().createTransaction(data);

      // Get fresh data
      const txs = await getDb().getTransactions();
      setTransactions(txs);

      const bgts = await getDb().getBudgets(activeMonth);
      setBudgets(bgts);

      if (data.type === "expense") {
        const valFormatted = formatVal(Number(data.amount));

        toast.success("Expense Added", {
          description: `Logged "${data.title}" of ${valFormatted}.`,
        });

        addNotification(
          "Expense Added",
          `Logged "${data.title}" of ${valFormatted}.`,
          "success",
        );

        // Check budget limits for this category
        const categoryBudget = bgts.find(
          (b) => b.category.toLowerCase() === data.category.toLowerCase(),
        );
        if (categoryBudget) {
          const categoryTxs = txs.filter(
            (t) =>
              t.type === "expense" &&
              t.category.toLowerCase() === data.category.toLowerCase() &&
              t.date.substring(0, 7) === activeMonth,
          );
          const totalSpent = categoryTxs.reduce(
            (sum, t) => sum + Number(t.amount),
            0,
          );
          const limit = Number(categoryBudget.limit_amount);

          if (totalSpent >= limit) {
            toast.error("Budget Limit Exceeded", {
              description: `You have spent ${formatVal(totalSpent)} of ${formatVal(limit)} limit in ${data.category}.`,
              duration: 6000,
            });
            addNotification(
              "Budget Limit Exceeded",
              `Spent ${formatVal(totalSpent)} of ${formatVal(limit)} limit in ${data.category}.`,
              "warning",
            );
          } else if (totalSpent >= limit * 0.85) {
            toast.warning("Budget Limit Warning", {
              description: `You have spent ${formatVal(totalSpent)} (${Math.round((totalSpent / limit) * 100)}%) of ${formatVal(limit)} in ${data.category}.`,
              duration: 5000,
            });
            addNotification(
              "Budget Warning",
              `Spent ${formatVal(totalSpent)} (${Math.round((totalSpent / limit) * 100)}%) of ${formatVal(limit)} in ${data.category}.`,
              "warning",
            );
          }
        }
      } else {
        const valFormatted = formatVal(Number(data.amount));
        toast.success("Income Added", {
          description: `Logged "${data.title}" of ${valFormatted}.`,
        });
        addNotification(
          "Income Added",
          `Logged "${data.title}" of ${valFormatted}.`,
          "success",
        );
      }
    } catch (err) {
      console.error("Failed to add transaction:", err);
      toast.error("Error Adding Transaction", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
      throw err;
    }
  };

  const editTransaction = async (
    id: string,
    data: Partial<Omit<Transaction, "id" | "user_id" | "created_at">>,
  ) => {
    try {
      await getDb().updateTransaction(id, data);
      await refreshTransactions();
      await refreshBudgets(activeMonth);

      toast.success("Transaction Updated", {
        description: `Successfully updated "${data.title || "transaction"}".`,
      });
    } catch (err) {
      console.error("Failed to edit transaction:", err);
      toast.error("Error Updating Transaction", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
      throw err;
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await getDb().deleteTransaction(id);
      await refreshTransactions();
      await refreshBudgets(activeMonth);

      toast.success("Transaction Deleted", {
        description: "The transaction has been removed.",
      });
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      toast.error("Error Deleting Transaction", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
      throw err;
    }
  };

  const updateBudget = async (
    category: string,
    limit: number | undefined,
    month: string,
  ) => {
    try {
      if (limit === undefined) {
        await getDb().deleteBudget(category, month);
        toast.success("Budget Updated", {
          description: `Removed budget for ${category}.`,
        });
        addNotification(
          "Budget Updated",
          `Removed budget for ${category}.`,
          "info",
        );
      } else {
        await getDb().setBudget({ category, limit_amount: limit, month });
        const limitFormatted = formatVal(limit);
        toast.success("Budget Updated", {
          description: `Set budget limit for ${category} to ${limitFormatted}.`,
        });
        addNotification(
          "Budget Updated",
          `Set budget limit for ${category} to ${limitFormatted}.`,
          "info",
        );
      }
      await refreshBudgets(month);
    } catch (err) {
      console.error("Failed to set budget:", err);
      toast.error("Error Saving Budget", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
      throw err;
    }
  };

  const updateProfile = async (
    data: Partial<Omit<Profile, "id" | "email" | "created_at">>,
  ) => {
    try {
      const { withTimeout } = await import("@/lib/utils");
      const updated = await withTimeout(
        getDb().updateProfile(data),
        10000,
        "Supabase connection timed out. You may be paused or offline.",
      );
      setProfile(updated);
      toast.success("Profile Saved", {
        description: "Your preferences have been successfully updated.",
      });
      addNotification(
        "Profile Settings Saved",
        "Your preferences and notification settings have been updated.",
        "success",
      );
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Error Saving Profile", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
      throw err;
    }
  };

  const logOut = async () => {
    try {
      await getDb().signOut();
      setProfile(null);
      setTransactions([]);
      setBudgets([]);
      if (typeof window !== "undefined" && !getDb().isDemoMode) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        isDemo: getDb().isDemoMode,
        profile,
        transactions,
        budgets,
        loading,
        isSyncing,
        activeMonth,
        setActiveMonth,
        refreshTransactions,
        refreshBudgets,
        addTransaction,
        editTransaction,
        removeTransaction,
        updateBudget,
        updateProfile,
        logOut,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}
