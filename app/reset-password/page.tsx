"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { supabase, hasSupabase } from '@/lib/supabase';
import { resetPasswordSchema, ResetPasswordFormValues } from '@/schemas/settings-schema';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setLoading(true);

    try {
      if (!hasSupabase || !supabase) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const stored = localStorage.getItem('et_profile');
        if (stored) {
          try {
            const profile = JSON.parse(stored);
            localStorage.setItem('et_profile', JSON.stringify({ ...profile, mock_password_updated: true }));
          } catch (e) {
            console.error(e);
          }
        }
        
        toast.success('Password updated successfully (Demo Mode)');
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 1800);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reset password.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between animate-page-enter">
      {/* Top Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-base tracking-tight">
            <Logo size={24} />
            <span>ScalePay</span>
          </Link>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-150">
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </header>

      {/* Center Form Container */}
      <main className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
        <div className="w-full max-w-md animate-stagger-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-semibold">Reset Password</CardTitle>
              <CardDescription className="text-xs font-normal">
                Enter your new password to regain account access.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pb-6 px-6">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-6 animate-in fade-in-0 duration-150">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Password Updated</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-normal">
                      Redirecting to sign-in page...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password" className="text-xs font-medium">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 text-sm"
                        {...register('password')}
                        showPasswordVisibilityToggle
                      />
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 text-sm"
                        {...register('confirmPassword')}
                        showPasswordVisibilityToggle
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full font-medium mt-2" disabled={loading}>
                    {loading ? 'Updating...' : 'Set New Password'}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors duration-150"
                    >
                      Cancel and return to sign in
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-5 border-t border-border text-center text-xs text-muted-foreground font-normal">
        <p>© 2026 ScalePay. All financial records protected by database encryption.</p>
      </footer>
    </div>
  );
}
