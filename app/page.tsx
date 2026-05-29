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
  Sparkles,
  ArrowRight,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { Logo } from "@/components/logo";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Loading ScalePay...</p>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabase || !supabase) {
      setAuthError(
        "Supabase environment variables are missing. Please use Demo Mode.",
      );
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
        alert(
          "Registration successful! Check your email or sign in (if confirmation is off).",
        );
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // The providers hook will automatically pick up the session and redirect
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An authentication error occurred.";
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoMode = () => {
    // Demo mode handles itself because db-provider.ts automatically mocks a profile
    // if hasSupabase is false. If hasSupabase is true, we still let them proceed by triggering redirect.
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0" />

      {/* Main layout container */}
      <main className="container mx-auto px-4 py-8 lg:py-16 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 z-10">
        {/* Left Column: Branding and Selling Points */}
        <div className="flex-1 flex flex-col space-y-6 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold w-fit mx-auto lg:mx-0">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fintech Personal Wealth Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Take control of your{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              expenses
            </span>{" "}
            in real-time.
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto lg:mx-0">
            A beautiful, developer-friendly financial dashboard. Log
            transactions, structure budgets, and visualize trends with
            interactive charts.
          </p>

          {/* Core features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-start gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Interactive Analytics</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualize income vs expense trends dynamically.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Budget Allocation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define monthly categories and check alert thresholds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="w-full max-w-md">
          <Card className="border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Supabase Status Banner */}
            {!hasSupabase && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <p className="font-semibold">Offline Demo Mode Active</p>
                  <p className="mt-0.5 text-amber-300/80">
                    No database configured. Your data will be stored securely on
                    your device.
                  </p>
                </div>
              </div>
            )}

            <CardHeader className="text-center pt-6">
              <div className="flex justify-center mb-2">
                <Logo size={44} />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Welcome to ScalePay
              </CardTitle>
              <CardDescription>
                {hasSupabase
                  ? "Sign in to access your cloud vault"
                  : "Launch Demo Mode to explore instantly"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pb-6">
              {hasSupabase ? (
                <>
                  <form onSubmit={handleAuth} className="space-y-3">
                    {isSignUp && (
                      <div className="space-y-1">
                        <Label htmlFor="auth-name">Full Name</Label>
                        <Input
                          id="auth-name"
                          placeholder="Your Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="bg-slate-900 border-slate-800 text-slate-100"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label htmlFor="auth-email">Email Address</Label>
                      <Input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-slate-900 border-slate-800 text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="auth-password">Password</Label>
                      <Input
                        id="auth-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-slate-900 border-slate-800 text-slate-100"
                        showPasswordVisibilityToggle
                      />
                    </div>

                    {authError && (
                      <p className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-md border border-rose-500/20">
                        {authError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full font-semibold"
                      disabled={authLoading}
                    >
                      {authLoading
                        ? "Verifying..."
                        : isSignUp
                          ? "Create Account"
                          : "Sign In"}
                    </Button>
                  </form>

                  <div className="text-center text-xs text-slate-500">
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="hover:underline text-primary hover:text-indigo-400 cursor-pointer"
                    >
                      {isSignUp
                        ? "Already have an account? Sign In"
                        : "Don't have an account? Sign Up"}
                    </button>
                  </div>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <span className="relative bg-slate-950 px-3 text-xs text-slate-500 uppercase">
                      Or
                    </span>
                  </div>
                </>
              ) : null}

              {/* Demo Mode Trigger Button */}
              <Button
                variant={hasSupabase ? "outline" : "default"}
                className="w-full flex items-center justify-center gap-2 group font-semibold border-slate-800 hover:bg-slate-900/50"
                onClick={handleDemoMode}
              >
                <span>Launch Offline Demo</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500 z-10 bg-slate-950/20">
        <p>
          © 2026 ScalePay Personal Finance. Secure local-first encryption &
          Supabase DB.
        </p>
      </footer>
    </div>
  );
}
