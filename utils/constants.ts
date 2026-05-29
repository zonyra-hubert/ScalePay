import { CategoryPreset } from '@/types';

export const CATEGORY_PRESETS: CategoryPreset[] = [
  { id: 'salary', label: 'Salary', color: '#10b981', icon: 'Briefcase' }, // Emerald
  { id: 'food', label: 'Food & Dining', color: '#f97316', icon: 'Utensils' }, // Orange
  { id: 'rent', label: 'Rent & Utilities', color: '#6366f1', icon: 'Home' }, // Indigo
  { id: 'transport', label: 'Transport', color: '#0ea5e9', icon: 'Car' }, // Sky
  { id: 'shopping', label: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' }, // Pink
  { id: 'entertainment', label: 'Entertainment', color: '#a855f7', icon: 'Film' }, // Purple
  { id: 'investments', label: 'Investments', color: '#06b6d4', icon: 'TrendingUp' }, // Cyan
  { id: 'other', label: 'Other', color: '#64748b', icon: 'Coins' }, // Slate
];

export const CATEGORY_MAP = CATEGORY_PRESETS.reduce((acc, cat) => {
  acc[cat.label] = cat;
  return acc;
}, {} as Record<string, CategoryPreset>);
