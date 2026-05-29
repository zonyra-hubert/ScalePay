'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/components/providers/notification-provider';
import { Bell, BellOff, Check, CheckCircle2, AlertTriangle, Info, Trash2, Clock } from 'lucide-react';

export function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-[18px] w-[18px] text-amber-500 shrink-0" />;
      case 'error':
        return <AlertTriangle className="h-[18px] w-[18px] text-rose-500 shrink-0" />;
      default:
        return <Info className="h-[18px] w-[18px] text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer flex items-center justify-center"
        aria-label="View notifications"
        id="notification-bell-btn"
      >
        <Bell className={`h-[18px] w-[18px] ${unreadCount > 0 ? 'animate-pulse text-primary' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card text-foreground shadow-xl z-50 overflow-hidden transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  title="Mark all as read"
                >
                  <Check className="h-3 w-3" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  title="Clear all"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="p-3 bg-muted/30 rounded-full mb-3 text-muted-foreground">
                  <BellOff className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm mb-1">All caught up!</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  You have no notifications. Warnings and confirmations will show here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && markAsRead(item.id)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-muted/30 ${
                    !item.read ? 'bg-muted/10 font-medium' : ''
                  }`}
                >
                  {/* Status Indicator Bar */}
                  {!item.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                  )}

                  {/* Icon */}
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Check action button on hover */}
                  {!item.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(item.id);
                      }}
                      className="hidden group-hover:flex absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-background hover:bg-accent border border-border text-foreground hover:text-primary rounded-md shadow-sm transition-all duration-150 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
