"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDatabase } from "@/hooks/use-database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  const router = useRouter();
  const { profile, loading } = useDatabase();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!loading && profile) {
      router.push("/dashboard");
    }
  }, [profile, loading, router]);

  if (loading || profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">Loading ScalePay...</p>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabase || !supabase) {
      setAuthError("Supabase environment variables are missing. Please use Demo Mode.");
      return;
    }

    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created successfully. Check your email or sign in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Authentication error occurred.";
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoMode = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("force_demo_mode", "true");
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between animate-page-enter">
      {/* Top Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-base tracking-tight">
            <Logo size={24} />
            <span>ScalePay</span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-12 lg:py-20 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 max-w-6xl">
        {/* Left Column: Product Information */}
        <div className="flex-1 space-y-6 max-w-xl text-left animate-stagger-1">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Wealth & Accounting
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              Structured personal finance tracking.
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-normal">
              Maintain a real-time transaction ledger, formulate monthly category budgets, and inspect cash flow trends with structured analytics.
            </p>
          </div>

          {/* Three Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-lg border border-border bg-card transition-colors duration-150">
              <TrendingUp className="h-4 w-4 text-foreground mb-2" />
              <h2 className="font-semibold text-xs text-foreground">Cash Flow Trends</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug font-normal">
                Track income vs. expense performance over time.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-card transition-colors duration-150">
              <Wallet className="h-4 w-4 text-foreground mb-2" />
              <h2 className="font-semibold text-xs text-foreground">Budget Targets</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug font-normal">
                Set category spending limits with threshold alerts.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-card transition-colors duration-150">
              <ShieldCheck className="h-4 w-4 text-foreground mb-2" />
              <h2 className="font-semibold text-xs text-foreground">Data Isolation</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug font-normal">
                Protected by PostgreSQL Row-Level Security.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="w-full max-w-md animate-stagger-2">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                {isSignUp ? "Create an account" : "Sign in to ScalePay"}
              </CardTitle>
              <CardDescription className="text-xs font-normal">
                {hasSupabase
                  ? isSignUp
                    ? "Enter your details to register a new vault"
                    : "Access your financial records and dashboard"
                  : "Database is unconfigured. Launch Demo Mode to test immediately."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {hasSupabase && (
                <form onSubmit={handleAuth} className="space-y-3">
                  {isSignUp && (
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-name" className="text-xs font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="auth-name"
                          placeholder="Alex Mercer"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="pl-9 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="auth-email" className="text-xs font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="auth-email"
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auth-password" className="text-xs font-medium">Password</Label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => router.push("/reset-password")}
                          className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors duration-150"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="auth-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-9 text-sm"
                        showPasswordVisibilityToggle
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-2.5 rounded-md text-xs text-destructive bg-destructive/10 border border-destructive/20 animate-in fade-in-0 duration-150">
                      {authError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full font-medium mt-1"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : isSignUp ? (
                      "Create Account"
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors duration-150"
                    >
                      {isSignUp
                        ? "Already have an account? Sign In"
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              )}

              {/* Demo Mode Button */}
              <div className="pt-2 border-t border-border space-y-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium"
                  onClick={handleDemoMode}
                >
                  <span>Explore Offline Demo Mode</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <p className="text-xs text-muted-foreground text-center font-normal">
                  Stores records locally in browser storage without connecting to Supabase.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 border-t border-border text-center text-xs text-muted-foreground font-normal">
        <p>© 2026 ScalePay. All financial records strictly isolated by database policy.</p>
      </footer>
    </div>
  );
}
