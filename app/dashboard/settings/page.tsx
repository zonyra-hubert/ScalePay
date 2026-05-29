'use client';

import React, { useState } from 'react';
import { User, ShieldAlert, Sparkles } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences, local currency, security, and notification settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs (Sidebar on desktop, horizontal bar on mobile) */}
        <div className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none border-b md:border-b-0 border-border md:col-span-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <User size={16} />
            <span>Profile & Preferences</span>
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <ShieldAlert size={16} />
            <span>Security & Security Settings</span>
          </button>
        </div>

        {/* Tab Content Pane */}
        <div className="md:col-span-3 space-y-6">
          {/* Demo Mode Banner (within Settings) */}
          {isDemo && (
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500/90 text-xs font-medium flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Running in Demo Mode</span>
                Your settings changes will be saved to your browser&apos;s local storage database instead of the live remote server.
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold">Profile & Preferences</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Customize your personal profile, set your reporting currency, theme, and specify email alert thresholds.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ProfileForm />
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold">Security Settings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Update your authentication password to keep your financial ledger secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <PasswordForm />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
