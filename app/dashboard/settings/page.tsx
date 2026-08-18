'use client';

import React, { useState } from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { useDatabase } from '@/hooks/use-database';
import { ProfileForm } from '@/components/forms/profile-form';
import { PasswordForm } from '@/components/forms/password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type SettingsTab = 'profile' | 'security';

export default function SettingsPage() {
  const { isDemo } = useDatabase();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header section */}
      <div className="pb-1 animate-stagger-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
          Manage currency preferences, appearance, notifications, and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-stagger-2">
        {/* Navigation Tabs */}
        <div className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none border-b md:border-b-0 border-border md:col-span-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-[background-color,color] duration-150 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-secondary text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <User size={15} />
            <span>Profile & Preferences</span>
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-[background-color,color] duration-150 whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-secondary text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab Content Pane */}
        <div className="md:col-span-3 space-y-6">
          {/* Demo Mode Notice */}
          {isDemo && (
            <div className="p-3 rounded-md border border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2">
              <span className="font-semibold block">Demo Mode Active:</span>
              <span className="text-muted-foreground font-normal">
                Settings updates are stored in your local browser storage session.
              </span>
            </div>
          )}

          {activeTab === 'profile' && (
            <Card className="border-border bg-card animate-in fade-in-0 duration-150">
              <CardHeader className="border-b border-border/60 pb-4 pt-4 px-5">
                <CardTitle className="text-base font-semibold">Profile & Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Configure display name, base currency, interface theme, and alert thresholds.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <ProfileForm />
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="border-border bg-card animate-in fade-in-0 duration-150">
              <CardHeader className="border-b border-border/60 pb-4 pt-4 px-5">
                <CardTitle className="text-base font-semibold">Security Settings</CardTitle>
                <CardDescription className="text-xs">
                  Update your authentication password to protect your financial ledger.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <PasswordForm />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
