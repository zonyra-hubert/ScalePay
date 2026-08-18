"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDatabase } from "@/hooks/use-database";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  LogOut,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/logo";

export function Navbar() {
  const pathname = usePathname();
  const { profile, logOut, isDemo } = useDatabase();

  if (!profile) return null;

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/budgets", label: "Budgets", icon: Wallet },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-semibold text-base sm:text-lg tracking-tight text-foreground"
            >
              <Logo size={24} />
              <span>ScalePay</span>
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isDemo && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Demo
              </span>
            )}

            <ModeToggle />
            <NotificationsDropdown />

            {/* User Details & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "User"}
                  className="w-7 h-7 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-secondary text-foreground font-medium text-xs flex items-center justify-center border border-border">
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-medium text-foreground leading-tight">
                  {profile.full_name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {profile.email}
                </span>
              </div>
              <button
                onClick={() => logOut()}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
                id="logout-btn"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 border-t border-border bg-background">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
