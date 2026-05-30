/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { profileSchema, ProfileFormValues } from '@/schemas/settings-schema';
import { useDatabase } from '@/hooks/use-database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const CURRENCIES = [
  { code: 'GHS', name: 'Ghanaian Cedi (₵)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
];

export function ProfileForm() {
  const { profile, updateProfile } = useDatabase();
  const { setTheme } = useTheme();
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      full_name: '',
      avatar_url: '',
      currency: 'GHS',
      theme: 'dark',
      email_alerts: true,
      monthly_summary: true,
    },
  });

  // Populate form with current values when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        currency: profile.currency || 'GHS',
        theme: profile.theme || 'dark',
        email_alerts: profile.email_alerts ?? true,
        monthly_summary: profile.monthly_summary ?? true,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setSaveError(null);
    try {
      await updateProfile({
        full_name: values.full_name,
        avatar_url: values.avatar_url || undefined,
        currency: values.currency,
        theme: values.theme,
        email_alerts: values.email_alerts,
        monthly_summary: values.monthly_summary,
      });

      // Update local next-themes context, but do not let theme persistence block the save.
      try {
        setTheme(values.theme);
      } catch (themeError) {
        console.error('Failed to update theme locally:', themeError);
      }

      reset(values); // reset dirty fields state
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save preferences.';
      setSaveError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            placeholder="Alex Mercer"
            {...register('full_name')}
            className={errors.full_name ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        {/* Currency Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="currency">Preferred Currency</Label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="currency"
                  className={errors.currency ? 'border-destructive focus-visible:ring-destructive' : ''}
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code} className="cursor-pointer">
                      {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.currency && (
            <p className="text-xs text-destructive">{errors.currency.message}</p>
          )}
        </div>
      </div>

      {/* Avatar URL */}
      <div className="space-y-1.5">
        <Label htmlFor="avatar_url">Avatar Image URL</Label>
        <div className="flex gap-4 items-center">
          {profile?.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt="Avatar Preview"
              className="h-10 w-10 rounded-full border border-border object-cover bg-secondary"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80';
              }}
            />
          )}
          <Input
            id="avatar_url"
            placeholder="https://example.com/avatar.jpg"
            {...register('avatar_url')}
            className={`flex-grow ${errors.avatar_url ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
        </div>
        {errors.avatar_url && (
          <p className="text-xs text-destructive">{errors.avatar_url.message}</p>
        )}
      </div>

      {/* Theme Selection */}
      <div className="space-y-1.5">
        <Label htmlFor="theme">App Theme</Label>
        <Controller
          name="theme"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger
                id="theme"
                className={errors.theme ? 'border-destructive focus-visible:ring-destructive' : ''}
              >
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light" className="cursor-pointer">Light Mode</SelectItem>
                <SelectItem value="dark" className="cursor-pointer">Dark Mode</SelectItem>
                <SelectItem value="system" className="cursor-pointer">System Default</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.theme && (
          <p className="text-xs text-destructive">{errors.theme.message}</p>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
          <p className="text-xs text-muted-foreground">Select how and when you want to receive alerts.</p>
        </div>

        <div className="space-y-3">
          {/* Email Alerts */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card/30">
            <div className="space-y-0.5">
              <Label htmlFor="email_alerts" className="text-xs font-semibold text-foreground cursor-pointer">
                Budget Alerts
              </Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Get email notifications when spending exceeds 85% of budget.
              </p>
            </div>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                id="email_alerts"
                className="peer sr-only"
                {...register('email_alerts')}
              />
              <div className="h-5 w-9 rounded-full bg-muted border border-border/60 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-muted-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card/30">
            <div className="space-y-0.5">
              <Label htmlFor="monthly_summary" className="text-xs font-semibold text-foreground cursor-pointer">
                Monthly Summary
              </Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Receive a monthly breakdown report of your savings and spending.
              </p>
            </div>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                id="monthly_summary"
                className="peer sr-only"
                {...register('monthly_summary')}
              />
              <div className="h-5 w-9 rounded-full bg-muted border border-border/60 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-muted-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        {saveError && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {saveError}
          </p>
        )}
        <div className="flex justify-start">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
