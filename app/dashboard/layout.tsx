"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/hooks/use-database';
import { Navbar } from '@/components/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useDatabase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/');
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-5 md:py-8 max-w-7xl pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
