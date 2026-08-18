import { CategoryPreset } from '@/types';

export const CATEGORY_PRESETS: CategoryPreset[] = [
  { id: 'salary', label: 'Salary', color: '#16a34a', icon: 'Briefcase' },
  { id: 'food', label: 'Food & Dining', color: '#d97706', icon: 'Utensils' },
  { id: 'rent', label: 'Rent & Utilities', color: '#2563eb', icon: 'Home' },
  { id: 'transport', label: 'Transport', color: '#0284c7', icon: 'Car' },
  { id: 'shopping', label: 'Shopping', color: '#64748b', icon: 'ShoppingBag' },
  { id: 'entertainment', label: 'Entertainment', color: '#0d9488', icon: 'Film' },
  { id: 'investments', label: 'Investments', color: '#0891b2', icon: 'TrendingUp' },
  { id: 'other', label: 'Other', color: '#94a3b8', icon: 'Coins' },
];

export const CATEGORY_MAP = CATEGORY_PRESETS.reduce((acc, cat) => {
  acc[cat.label] = cat;
  return acc;
}, {} as Record<string, CategoryPreset>);
