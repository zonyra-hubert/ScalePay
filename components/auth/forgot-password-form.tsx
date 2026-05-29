"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase, hasSupabase } from '@/lib/supabase';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/schemas/auth-schema';
import { toast } from 'sonner';

interface ForgotPasswordFormProps {
  onBackToSignInClick: () => void;
}

export function ForgotPasswordForm({ onBackToSignInClick }: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    if (!hasSupabase || !supabase) {
      setAuthError('Supabase environment variables are missing. Recovery email cannot be sent.');
      return;
    }

    setAuthError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setSuccess(true);
      toast.success('Reset email sent!', {
        description: `Recovery instructions sent to ${values.email}.`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send recovery link.';
      setAuthError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {success ? (
        <div className="space-y-4 py-4 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">Check your inbox</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              We've emailed you instructions to set up a new password. If you don't receive it shortly, check your spam folder.
            </p>
          </div>
          <Button variant="outline" className="w-full font-semibold border-slate-800" onClick={onBackToSignInClick}>
            Return to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                className="bg-slate-900 border-slate-800 text-slate-100 pl-9"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          {authError && (
            <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-md border border-rose-500/20 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </p>
          )}

          <Button type="submit" className="w-full font-semibold mt-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center text-xs text-slate-500 pt-1">
            <button
              type="button"
              onClick={onBackToSignInClick}
              className="hover:underline text-primary hover:text-indigo-400 cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
