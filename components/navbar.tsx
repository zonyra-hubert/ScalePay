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
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight">
            <Logo size={28} />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              ScalePay
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Demo Mode Badge - hide text on very small screens */}
            {isDemo && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold">
                <Sparkles className="h-3 w-3" />
                <span className="hidden xs:inline">Demo</span>
              </div>
            )}

            {/* Theme Toggler */}
            <ModeToggle />

            {/* Notifications */}
            <NotificationsDropdown />

            {/* User Avatar + Name (desktop) */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-border">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-sm font-semibold leading-none">{profile.full_name}</span>
                <span className="text-xs text-muted-foreground">{profile.email}</span>
              </div>
              <button
                onClick={() => logOut()}
                className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
                id="logout-btn"
              >
                <LogOut className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 pb-safe border-t border-border bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
