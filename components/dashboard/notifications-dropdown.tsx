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
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md border border-border bg-background text-foreground hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center"
        aria-label="View notifications"
        id="notification-bell-btn"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5 rounded-full bg-foreground" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed left-4 right-4 top-16 w-auto sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-88 rounded-lg border border-border bg-card text-foreground shadow-md z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-medium border border-border/60">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  title="Mark all as read"
                >
                  <Check className="h-3 w-3" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  title="Clear all"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="p-2 bg-muted rounded-full mb-2 text-muted-foreground">
                  <BellOff className="h-4 w-4" />
                </div>
                <h4 className="font-semibold text-xs text-foreground mb-0.5">No notifications</h4>
                <p className="text-[11px] text-muted-foreground max-w-[200px]">
                  Alerts and budget threshold updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && markAsRead(item.id)}
                  className={`group relative flex items-start gap-2.5 p-3 transition-colors cursor-pointer hover:bg-muted/20 ${
                    !item.read ? 'bg-muted/10 font-medium' : ''
                  }`}
                >
                  {!item.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground" />
                  )}

                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>

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

                  {!item.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(item.id);
                      }}
                      className="hidden group-hover:flex absolute right-2.5 top-1/2 -translate-y-1/2 p-1 bg-card hover:bg-secondary border border-border text-foreground rounded transition-colors cursor-pointer"
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
