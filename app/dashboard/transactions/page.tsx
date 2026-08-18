"use client";

import React, { useState } from 'react';
import { useDatabase } from '@/hooks/use-database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TransactionForm } from '@/components/forms/transaction-form';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CATEGORY_PRESETS } from '@/utils/constants';
import { Transaction, TransactionType } from '@/types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Film,
  TrendingUp,
  Coins,
} from 'lucide-react';

const getCategoryIcon = (category: string) => {
  const iconSize = 14;
  switch (category) {
    case 'Salary':
      return <Briefcase size={iconSize} />;
    case 'Food & Dining':
      return <Utensils size={iconSize} />;
    case 'Rent & Utilities':
      return <Home size={iconSize} />;
    case 'Transport':
      return <Car size={iconSize} />;
    case 'Shopping':
      return <ShoppingBag size={iconSize} />;
    case 'Entertainment':
      return <Film size={iconSize} />;
    case 'Investments':
      return <TrendingUp size={iconSize} />;
    default:
      return <Coins size={iconSize} />;
  }
};

export default function TransactionsPage() {
  const { profile, transactions, removeTransaction } = useDatabase();
  const currency = profile?.currency || 'GHS';

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Apply filters
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch =
        tx.title.toLowerCase().includes(search.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()));

      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOrder === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOrder === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortOrder === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

  const handleDelete = async () => {
    if (deletingTxId) {
      try {
        await removeTransaction(deletingTxId);
        setDeletingTxId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 animate-stagger-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Transaction Ledger</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
            Filter, search, and reconcile payment records.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="h-8 gap-1.5 text-xs font-medium self-start sm:self-auto">
          <Plus size={14} />
          <span>New Transaction</span>
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border-border bg-card animate-stagger-2">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-muted-foreground h-3.5 w-3.5" />
              <Input
                placeholder="Search description or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            {/* Type Selector */}
            <div>
              <Select onValueChange={(val) => setTypeFilter(val as 'all' | TransactionType)} value={typeFilter}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="All Transaction Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Selector */}
            <div>
              <Select onValueChange={setCategoryFilter} value={categoryFilter}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORY_PRESETS.map((cat) => (
                    <SelectItem key={cat.id} value={cat.label}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Selector */}
            <div>
              <Select onValueChange={(val) => setSortOrder(val as 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc')} value={sortOrder}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="amount-desc">Amount (Highest First)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Lowest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card className="border-border bg-card overflow-hidden animate-stagger-3">
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground font-normal">
              No transactions match the specified filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/20 text-muted-foreground font-medium">
                    <th className="py-3 px-4 font-medium">Description</th>
                    <th className="py-3 px-4 hidden md:table-cell font-medium">Category</th>
                    <th className="py-3 px-4 hidden sm:table-cell font-medium">Date</th>
                    <th className="py-3 px-4 text-right font-medium">Amount</th>
                    <th className="py-3 px-4 text-center w-20 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredTransactions.map((tx) => {
                    const preset = CATEGORY_PRESETS.find((c) => c.label === tx.category);
                    return (
                      <tr key={tx.id} className="hover:bg-muted/20 transition-colors duration-150">
                        {/* Title and Mobile Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-md bg-secondary text-muted-foreground shrink-0 border border-border/60">
                              {getCategoryIcon(tx.category)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate max-w-[220px] sm:max-w-xs">{tx.title}</p>
                              {tx.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs font-normal">{tx.description}</p>
                              )}
                              <div className="flex gap-2 mt-0.5 sm:hidden text-xs text-muted-foreground font-normal">
                                <span>{tx.category}</span>
                                <span>·</span>
                                <span>{formatDate(tx.date)}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category (Hidden Mobile) */}
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border/60">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: preset?.color || '#94a3b8' }}
                            />
                            {tx.category}
                          </span>
                        </td>

                        {/* Date (Hidden Mobile) */}
                        <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell font-normal text-xs">
                          {formatDate(tx.date)}
                        </td>

                        {/* Amount */}
                        <td className={`py-3 px-4 text-right text-sm font-semibold tabular-nums ${
                          tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingTransaction(tx)}
                              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
                              title="Edit Transaction"
                              aria-label="Edit Transaction"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeletingTxId(tx.id)}
                              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 cursor-pointer"
                              title="Delete Transaction"
                              aria-label="Delete Transaction"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Modals */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">New Transaction</DialogTitle>
            <DialogDescription className="text-xs">
              Record a new payment or income deposit.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm onSuccess={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit Transaction</DialogTitle>
            <DialogDescription className="text-xs">
              Modify transaction details or categorical allocation.
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transaction={editingTransaction}
              onSuccess={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingTxId} onOpenChange={(open) => !open && setDeletingTxId(null)}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete Transaction</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this record? This action is permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingTxId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
