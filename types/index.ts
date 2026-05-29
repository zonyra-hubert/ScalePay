export type TransactionType = 'income' | 'expense';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'system';
  email_alerts?: boolean;
  monthly_summary?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  type: TransactionType;
  description?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  month: string; // YYYY-MM
  created_at: string;
}

export interface CategoryPreset {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  budgetProgress: {
    category: string;
    limit: number;
    spent: number;
    percentage: number;
  }[];
  monthlyChartData: {
    name: string; // E.g., Jan, Feb
    income: number;
    expense: number;
  }[];
  categoryChartData: {
    name: string; // Category label
    value: number; // Sum amount
    color: string;
  }[];
}

export interface DatabaseProvider {
  isDemoMode: boolean;
  getProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>) => Promise<Profile>;
  
  // Transactions
  getTransactions: () => Promise<Transaction[]>;
  createTransaction: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Budgets
  getBudgets: (month: string) => Promise<Budget[]>;
  setBudget: (data: { category: string; limit_amount: number; month: string }) => Promise<Budget>;
  deleteBudget: (category: string, month: string) => Promise<void>;
}
