"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { signInSchema, SignInFormValues } from "@/schemas/auth-schema";
import { toast } from "sonner";

interface SignInFormProps {
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
}

export function SignInForm({
  onSignUpClick,
  onForgotPasswordClick,
}: SignInFormProps) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    if (!hasSupabase || !supabase) {
      setAuthError(
        "Supabase environment variables are missing. Please use Demo Mode.",
      );
      return;
    }

    setAuthError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      toast.success("Signed in successfully");
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An authentication error occurred.";
      setAuthError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="signin-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="signin-email"
              type="email"
              placeholder="you@example.com"
              className="bg-slate-900 border-slate-800 text-slate-100 pl-9"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password">Password</Label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs text-primary hover:underline hover:text-indigo-400 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="signin-password"
              type="password"
              placeholder="••••••••"
              className="bg-slate-900 border-slate-800 text-slate-100 pl-9"
              {...register("password")}
              showPasswordVisibilityToggle
            />
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.password.message}
            </p>
          )}
        </div>

        {authError && (
          <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-md border border-rose-500/20 flex items-start gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </p>
        )}

        <Button
          type="submit"
          className="w-full font-semibold mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-1">
        <button
          onClick={onSignUpClick}
          className="hover:underline text-primary hover:text-indigo-400 cursor-pointer"
        >
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
}
