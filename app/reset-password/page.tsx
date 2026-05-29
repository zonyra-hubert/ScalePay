"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/logo';
import { supabase, hasSupabase } from '@/lib/supabase';
import { resetPasswordSchema, ResetPasswordFormValues } from '@/schemas/settings-schema';
import { toast } from 'sonner';

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
        // Offline Demo Mode mock success
        await new Promise((resolve) => setTimeout(resolve, 1200));
        
        // Mock profile update in localStorage
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
        }, 2000);
        return;
      }

      // Supabase Live Mode update password
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reset password.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0" />

      {/* Center Form Container */}
      <main className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center z-10">
        <div className="w-full max-w-md">
          <Card className="border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <CardHeader className="text-center pt-6">
              <div className="flex justify-center mb-2">
                <Logo size={44} />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>
                Enter your new security credentials below to regain account access
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pb-6">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Password Updated</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Redirecting you to the landing page to sign in...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-slate-900 border-slate-800 text-slate-100 pl-9"
                        {...register('password')}
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

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-slate-900 border-slate-800 text-slate-100 pl-9"
                        {...register('confirmPassword')}
                        showPasswordVisibilityToggle
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full font-semibold mt-2" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>

                  <div className="text-center text-xs text-slate-500 pt-2">
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="hover:underline text-slate-400 cursor-pointer"
                    >
                      Cancel and Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500 z-10 bg-slate-950/20">
        <p>© 2026 ScalePay Personal Finance. Secure local-first encryption & Supabase DB.</p>
      </footer>
    </div>
  );
}
