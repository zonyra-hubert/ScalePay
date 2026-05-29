"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDatabase } from '@/hooks/use-database';
import { ModeToggle } from '@/components/mode-toggle';
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown';
import { LayoutDashboard, Receipt, Wallet, LogOut, Sparkles, Settings } from 'lucide-react';
import { Logo } from '@/components/logo';

export function Navbar() {
  const pathname = usePathname();
  const { profile, logOut, isDemo } = useDatabase();

  if (!profile) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
    { href: '/dashboard/budgets', label: 'Budgets', icon: Wallet },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Logo size={32} />
          <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            ScalePay
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Demo Mode Badge */}
          {isDemo && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold animate-pulse-subtle">
              <Sparkles className="h-3 w-3" />
              <span>Demo Mode</span>
            </div>
          )}

          {/* Theme Toggler */}
          <ModeToggle />

          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-8 h-8 rounded-full border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-sm font-semibold leading-none">{profile.full_name}</span>
              <span className="text-xs text-muted-foreground">{profile.email}</span>
            </div>
            <button
              onClick={() => logOut()}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
              id="logout-btn"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <nav className="md:hidden flex items-center justify-around py-2 border-t border-border bg-background">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
