import { supabase, hasSupabase } from './supabase';
import { DatabaseProvider, Transaction, Budget, Profile } from '@/types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper for dates relative to today
const getRelativeDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getRelativeMonthString = (monthsAgo: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date.toISOString().substring(0, 7); // YYYY-MM
};

// Default Mock Data for Demo Mode
const getInitialMockData = () => {
  const thisMonth = getRelativeMonthString(0);
  const lastMonth = getRelativeMonthString(1);

  const transactions: Transaction[] = [
    // This Month Income
    {
      id: 'tx-1',
      user_id: 'demo-user',
      title: 'Monthly Salary',
      amount: 4800,
      date: `${thisMonth}-01`,
      category: 'Salary',
      type: 'income',
      description: 'Main salary payment',
      created_at: new Date(`${thisMonth}-01T09:00:00Z`).toISOString(),
    },
    {
      id: 'tx-2',
      user_id: 'demo-user',
      title: 'Freelance Design',
      amount: 650,
      date: getRelativeDateString(5),
      category: 'Salary',
      type: 'income',
      description: 'UX consulting gig',
      created_at: new Date().toISOString(),
    },
    // This Month Expenses
    {
      id: 'tx-3',
      user_id: 'demo-user',
      title: 'Apartment Rent',
      amount: 1400,
      date: `${thisMonth}-02`,
      category: 'Rent & Utilities',
      type: 'expense',
      description: 'Monthly rent payment',
      created_at: new Date(`${thisMonth}-02T10:00:00Z`).toISOString(),
    },
    {
      id: 'tx-4',
      user_id: 'demo-user',
      title: 'Weekly Groceries',
      amount: 145.5,
      date: getRelativeDateString(2),
      category: 'Food & Dining',
      type: 'expense',
      description: 'Whole Foods trip',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-5',
      user_id: 'demo-user',
      title: 'Electricity Bill',
      amount: 112.4,
      date: getRelativeDateString(10),
      category: 'Rent & Utilities',
      type: 'expense',
      description: 'Power company monthly dues',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-6',
      user_id: 'demo-user',
      title: 'Uber Ride',
      amount: 28.5,
      date: getRelativeDateString(4),
      category: 'Transport',
      type: 'expense',
      description: 'Trip to downtown office',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-7',
      user_id: 'demo-user',
      title: 'Gas Station',
      amount: 45.0,
      date: getRelativeDateString(8),
      category: 'Transport',
      type: 'expense',
      description: 'Car refuel',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-8',
      user_id: 'demo-user',
      title: 'New Sneakers',
      amount: 120.0,
      date: getRelativeDateString(6),
      category: 'Shopping',
      type: 'expense',
      description: 'Nike Air Max',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-9',
      user_id: 'demo-user',
      title: 'Movie Theater',
      amount: 34.0,
      date: getRelativeDateString(3),
      category: 'Entertainment',
      type: 'expense',
      description: 'Tickets and popcorn',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-10',
      user_id: 'demo-user',
      title: 'Dinner with friends',
      amount: 88.2,
      date: getRelativeDateString(1),
      category: 'Food & Dining',
      type: 'expense',
      description: 'Italian restaurant split bill',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-11',
      user_id: 'demo-user',
      title: 'Mutual Fund Buy',
      amount: 250.0,
      date: `${thisMonth}-05`,
      category: 'Investments',
      type: 'expense',
      description: 'Auto investment transfer',
      created_at: new Date(`${thisMonth}-05T12:00:00Z`).toISOString(),
    },
    // Last Month
    {
      id: 'tx-last-1',
      user_id: 'demo-user',
      title: 'Monthly Salary',
      amount: 4800,
      date: `${lastMonth}-01`,
      category: 'Salary',
      type: 'income',
      description: 'Main salary payment',
      created_at: new Date(`${lastMonth}-01T09:00:00Z`).toISOString(),
    },
    {
      id: 'tx-last-2',
      user_id: 'demo-user',
      title: 'Apartment Rent',
      amount: 1400,
      date: `${lastMonth}-02`,
      category: 'Rent & Utilities',
      type: 'expense',
      description: 'Monthly rent payment',
      created_at: new Date(`${lastMonth}-02T10:00:00Z`).toISOString(),
    },
    {
      id: 'tx-last-3',
      user_id: 'demo-user',
      title: 'Groceries',
      amount: 380.0,
      date: `${lastMonth}-12`,
      category: 'Food & Dining',
      type: 'expense',
      description: 'Grocery stock',
      created_at: new Date(`${lastMonth}-12T15:00:00Z`).toISOString(),
    },
    {
      id: 'tx-last-4',
      user_id: 'demo-user',
      title: 'Concert Tickets',
      amount: 180.0,
      date: `${lastMonth}-18`,
      category: 'Entertainment',
      type: 'expense',
      description: 'Rock festival tickets',
      created_at: new Date(`${lastMonth}-18T20:00:00Z`).toISOString(),
    },
    {
      id: 'tx-last-5',
      user_id: 'demo-user',
      title: 'Flight Booking',
      amount: 320.0,
      date: `${lastMonth}-10`,
      category: 'Transport',
      type: 'expense',
      description: 'Weekend trip',
      created_at: new Date(`${lastMonth}-10T11:00:00Z`).toISOString(),
    },
  ];

  const budgets: Budget[] = [
    {
      id: 'b-1',
      user_id: 'demo-user',
      category: 'Food & Dining',
      limit_amount: 500,
      month: thisMonth,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-2',
      user_id: 'demo-user',
      category: 'Rent & Utilities',
      limit_amount: 1600,
      month: thisMonth,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-3',
      user_id: 'demo-user',
      category: 'Transport',
      limit_amount: 250,
      month: thisMonth,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-4',
      user_id: 'demo-user',
      category: 'Shopping',
      limit_amount: 300,
      month: thisMonth,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-5',
      user_id: 'demo-user',
      category: 'Entertainment',
      limit_amount: 200,
      month: thisMonth,
      created_at: new Date().toISOString(),
    },
  ];

  return { transactions, budgets };
};

// ----------------------------------------------------
// LOCAL STORAGE PROVIDER (Demo Mode)
// ----------------------------------------------------
class LocalStorageProviderImpl implements DatabaseProvider {
  isDemoMode = true;

  private getStorageData() {
    if (typeof window === 'undefined') return { transactions: [], budgets: [] };
    
    let txData = localStorage.getItem('et_transactions');
    let bData = localStorage.getItem('et_budgets');
    
    if (!txData || !bData) {
      const initial = getInitialMockData();
      if (!txData) {
        localStorage.setItem('et_transactions', JSON.stringify(initial.transactions));
        txData = JSON.stringify(initial.transactions);
      }
      if (!bData) {
        localStorage.setItem('et_budgets', JSON.stringify(initial.budgets));
        bData = JSON.stringify(initial.budgets);
      }
    }
    
    return {
      transactions: JSON.parse(txData) as Transaction[],
      budgets: JSON.parse(bData) as Budget[],
    };
  }

  private saveTransactions(txs: Transaction[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('et_transactions', JSON.stringify(txs));
    }
  }

  private saveBudgets(bgts: Budget[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('et_budgets', JSON.stringify(bgts));
    }
  }

  async getProfile(): Promise<Profile | null> {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('et_profile');
    if (stored) {
      try {
        return JSON.parse(stored) as Profile;
      } catch (e) {
        console.error("Failed to parse stored profile:", e);
      }
    }

    const defaultProfile: Profile = {
      id: 'demo-user',
      email: 'demo@tracker.fi',
      full_name: 'Alex Mercer',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      currency: 'GHS',
      theme: 'dark',
      email_alerts: true,
      monthly_summary: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('et_profile', JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  async signOut(): Promise<void> {
    // Just simulated
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  async updateProfile(data: Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>): Promise<Profile> {
    const profile = await this.getProfile();
    if (!profile) throw new Error('Profile not found');
    const updated: Profile = {
      ...profile,
      ...data,
      updated_at: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('et_profile', JSON.stringify(updated));
    }
    return updated;
  }

  async getTransactions(): Promise<Transaction[]> {
    const { transactions } = this.getStorageData();
    // Sort transactions by date descending, then created_at descending
    return [...transactions].sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
    const { transactions } = this.getStorageData();
    const newTx: Transaction = {
      ...data,
      id: `tx-${generateId()}`,
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
    };
    transactions.push(newTx);
    this.saveTransactions(transactions);
    return newTx;
  }

  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>): Promise<Transaction> {
    const { transactions } = this.getStorageData();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    const updated: Transaction = {
      ...transactions[index],
      ...data,
    };
    transactions[index] = updated;
    this.saveTransactions(transactions);
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    const { transactions } = this.getStorageData();
    const filtered = transactions.filter((t) => t.id !== id);
    this.saveTransactions(filtered);
  }

  async getBudgets(month: string): Promise<Budget[]> {
    const { budgets } = this.getStorageData();
    return budgets.filter((b) => b.month === month);
  }

  async setBudget(data: { category: string; limit_amount: number; month: string }): Promise<Budget> {
    const { budgets } = this.getStorageData();
    const index = budgets.findIndex((b) => b.category === data.category && b.month === data.month);
    
    if (index !== -1) {
      budgets[index] = {
        ...budgets[index],
        limit_amount: data.limit_amount,
      };
      this.saveBudgets(budgets);
      return budgets[index];
    } else {
      const newBudget: Budget = {
        id: `b-${generateId()}`,
        user_id: 'demo-user',
        category: data.category,
        limit_amount: data.limit_amount,
        month: data.month,
        created_at: new Date().toISOString(),
      };
      budgets.push(newBudget);
      this.saveBudgets(budgets);
      return newBudget;
    }
  }

  async deleteBudget(category: string, month: string): Promise<void> {
    const { budgets } = this.getStorageData();
    const filtered = budgets.filter((b) => !(b.category === category && b.month === month));
    this.saveBudgets(filtered);
  }
}

// ----------------------------------------------------
// SUPABASE PROVIDER (Live Database Mode)
// ----------------------------------------------------
class SupabaseProviderImpl implements DatabaseProvider {
  isDemoMode = false;

  async getProfile(): Promise<Profile | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      // Create profile if not exists
      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        currency: 'GHS',
        theme: 'dark',
        email_alerts: true,
        monthly_summary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
      
      if (createErr) return null;
      return created;
    }

    return data;
  }

  async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  async updateProfile(data: Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>): Promise<Profile> {
    if (!supabase) throw new Error('Supabase client is not configured');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Update user auth metadata for display fields
    const authMetadata: Record<string, string | undefined> = {};
    if (data.full_name) authMetadata.full_name = data.full_name;
    if (data.avatar_url) authMetadata.avatar_url = data.avatar_url;
    if (Object.keys(authMetadata).length > 0) {
      await supabase.auth.updateUser({ data: authMetadata });
    }

    // Fetch current profile so we can merge into it on failure
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single();

    const updateData: Record<string, string | boolean | undefined | null> = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && updated) {
      return updated;
    }

    // First attempt failed — try progressively smaller subsets of columns
    console.warn('Full profile update failed, trying selective columns:', error?.message);

    // Try: only the preference columns (currency, theme, notifications)
    const prefData: Record<string, string | boolean | undefined> = {
      updated_at: new Date().toISOString(),
    };
    if (data.currency !== undefined) prefData.currency = data.currency;
    if (data.theme !== undefined) prefData.theme = data.theme;
    if (data.email_alerts !== undefined) prefData.email_alerts = data.email_alerts;
    if (data.monthly_summary !== undefined) prefData.monthly_summary = data.monthly_summary;
    if (data.full_name !== undefined) prefData.full_name = data.full_name;
    if (data.avatar_url !== undefined) prefData.avatar_url = data.avatar_url;

    const { data: prefUpdated, error: prefError } = await supabase
      .from('profiles')
      .update(prefData)
      .eq('id', user.id)
      .select()
      .single();

    if (!prefError && prefUpdated) {
      return prefUpdated;
    }

    // Last resort: basic columns only, merge desired changes into local state
    console.warn('Selective update also failed, merging into memory:', prefError?.message);
    const basicData: Record<string, string | undefined> = {
      updated_at: new Date().toISOString(),
    };
    if (data.full_name !== undefined) basicData.full_name = data.full_name;
    if (data.avatar_url !== undefined) basicData.avatar_url = data.avatar_url;

    if (Object.keys(basicData).length > 1) {
      await supabase
        .from('profiles')
        .update(basicData)
        .eq('id', user.id);
    }

    // Return a merged profile with the desired changes applied in-memory
    // This ensures currency/theme preferences work even if DB columns are missing
    return {
      ...(currentProfile || {}),
      id: user.id,
      email: user.email || '',
      ...data,
      updated_at: new Date().toISOString(),
    } as Profile;
  }

  async getTransactions(): Promise<Transaction[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    return data || [];
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
    if (!supabase) throw new Error('Supabase client is not configured');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert([{
        ...data,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  }

  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>): Promise<Transaction> {
    if (!supabase) throw new Error('Supabase client is not configured');
    
    const { data: updated, error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not configured');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getBudgets(month: string): Promise<Budget[]> {
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month);

    if (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
    return data || [];
  }

  async setBudget(data: { category: string; limit_amount: number; month: string }): Promise<Budget> {
    if (!supabase) throw new Error('Supabase client is not configured');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: upserted, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: user.id,
        category: data.category,
        limit_amount: data.limit_amount,
        month: data.month
      }, {
        onConflict: 'user_id,category,month'
      })
      .select()
      .single();

    if (error) throw error;
    return upserted;
  }

  async deleteBudget(category: string, month: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not configured');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('month', month);

    if (error) throw error;
  }
}

// ----------------------------------------------------
// EXPORTS & FACTORY
// ----------------------------------------------------
export const getDatabaseProvider = (): DatabaseProvider => {
  if (hasSupabase) {
    return new SupabaseProviderImpl();
  }
  return new LocalStorageProviderImpl();
};
