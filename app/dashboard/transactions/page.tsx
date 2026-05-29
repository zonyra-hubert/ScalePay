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

// Helper to render category icon
const getCategoryIcon = (category: string) => {
  const iconSize = 16;
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
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm">Add, filter, edit, or delete transactions.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-1 shadow-sm font-semibold self-start sm:self-auto">
          <Plus size={16} />
          <span>New Transaction</span>
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search description/title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Selector */}
            <div>
              <Select onValueChange={(val) => setTypeFilter(val as 'all' | TransactionType)} value={typeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                  <SelectItem value="income">Incomes Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Selector */}
            <div>
              <Select onValueChange={setCategoryFilter} value={categoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No transactions match your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                    <th className="p-4">Transaction</th>
                    <th className="p-4 hidden md:table-cell">Category</th>
                    <th className="p-4 hidden sm:table-cell">Date</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredTransactions.map((tx) => {
                    const preset = CATEGORY_PRESETS.find((c) => c.label === tx.category);
                    return (
                      <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                        {/* Title and Mobile Details */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2.5 rounded-lg border flex items-center justify-center shrink-0"
                              style={{
                                color: preset?.color || '#94a3b8',
                                backgroundColor: `${preset?.color || '#94a3b8'}12`,
                                borderColor: `${preset?.color || '#94a3b8'}25`,
                              }}
                            >
                              {getCategoryIcon(tx.category)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">{tx.title}</p>
                              {tx.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-xs">{tx.description}</p>
                              )}
                              {/* Mobile Subtitles */}
                              <div className="flex gap-2 mt-1 sm:hidden text-[10px] text-muted-foreground">
                                <span>{tx.category}</span>
                                <span>•</span>
                                <span>{formatDate(tx.date)}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category (Hidden Mobile) */}
                        <td className="p-4 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/65 text-muted-foreground border border-border/50">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: preset?.color || '#94a3b8' }}
                            />
                            {tx.category}
                          </span>
                        </td>

                        {/* Date (Hidden Mobile) */}
                        <td className="p-4 text-muted-foreground hidden sm:table-cell">
                          {formatDate(tx.date)}
                        </td>

                        {/* Amount */}
                        <td className={`p-4 text-right font-bold text-base whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingTransaction(tx)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              title="Edit Transaction"
                              aria-label="Edit Transaction"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeletingTxId(tx.id)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Delete Transaction"
                              aria-label="Delete Transaction"
                            >
                              <Trash2 size={15} />
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

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Create a new transaction to record your cash flow.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm onSuccess={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction details.
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

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingTxId} onOpenChange={(open) => !open && setDeletingTxId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This transaction will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingTxId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
