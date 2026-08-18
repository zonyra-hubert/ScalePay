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
        <div className="space-y-3 py-3 text-center">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Check your inbox</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              We&apos;ve sent recovery instructions to your email address.
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full font-medium" onClick={onBackToSignInClick}>
            Return to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-xs font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@domain.com"
                className="pl-9 text-sm"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          {authError && (
            <div className="p-2.5 rounded-md text-xs text-destructive bg-destructive/10 border border-destructive/20 flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <Button type="submit" className="w-full font-medium mt-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground pt-1">
            <button
              type="button"
              onClick={onBackToSignInClick}
              className="hover:underline hover:text-foreground cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
