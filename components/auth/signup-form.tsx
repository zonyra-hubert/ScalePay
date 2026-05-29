"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, hasSupabase } from '@/lib/supabase';
import { signUpSchema, SignUpFormValues } from '@/schemas/auth-schema';
import { toast } from 'sonner';

interface SignUpFormProps {
  onSignInClick: () => void;
}

export function SignUpForm({ onSignInClick }: SignUpFormProps) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    if (!hasSupabase || !supabase) {
      setAuthError('Supabase environment variables are missing. Please use Demo Mode.');
      return;
    }

    setAuthError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) throw error;
      
      toast.success('Registration successful!', {
        description: 'Check your email to confirm registration or sign in.',
      });
      onSignInClick();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during registration.';
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
          <Label htmlFor="signup-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="signup-name"
              placeholder="Your Name"
              className="bg-slate-900 border-slate-800 text-slate-100 pl-9"
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="signup-email"
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

        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="signup-password"
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-1">
        <button
          onClick={onSignInClick}
          className="hover:underline text-primary hover:text-indigo-400 cursor-pointer"
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
}
