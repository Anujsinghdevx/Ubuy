'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, CheckCircle, XCircle, Gavel, Info, Bell } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type NotificationType = 'win' | 'bid' | 'close' | 'admin' | 'general';

export type Notification = {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};
interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onDelete?: (id: string) => Promise<void> | void;
  onMarkRead?: (id: string) => Promise<void> | void;
}

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((d - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  let value = diffSec;
  for (let i = 0; i < steps.length; i++) {
    const [step, nextUnit] = steps[i];
    if (Math.abs(value) < step) {
      unit = nextUnit;
      break;
    }
    value = Math.round(value / step);
  }
  return rtf.format(value, unit);
}

function coerceType(t: string): NotificationType {
  if (t === 'win' || t === 'bid' || t === 'close' || t === 'admin') return t;
  return 'general';
}

export default function NotificationDropdown({
  notifications,
  onClose,
  onDelete,
  onMarkRead,
}: NotificationDropdownProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<Notification[]>(notifications);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setList(notifications), [notifications]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const iconFor = (type: NotificationType) => {
    const common = 'w-5 h-5';
    switch (type) {
      case 'win':
        return <CheckCircle className={`${common} text-green-600`} aria-hidden />;
      case 'bid':
        return <Gavel className={`${common} text-indigo-600`} aria-hidden />;
      case 'close':
        return <XCircle className={`${common} text-red-600`} aria-hidden />;
      case 'admin':
        return <Info className={`${common} text-yellow-600`} aria-hidden />;
      default:
        return <Bell className={`${common} text-emerald-600`} aria-hidden />;
    }
  };

  const handleDelete = async (id: string) => {
    setList((prev) => prev.filter((n) => n._id !== id));
    try {
      if (onDelete) {
        await onDelete(id);
      } else {
        const res = await fetch(`/api/notification/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
      setList((prev) => {
        const fromProps = notifications.find((n) => n._id === id);
        return fromProps
          ? [...prev, fromProps].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
          : prev;
      });
    }
  };

  const handleMarkRead = async (id: string) => {
    setList((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      if (onMarkRead) {
        await onMarkRead(id);
      } else {
        const res = await fetch(`/api/notification/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        });
        if (!res.ok) throw new Error('Mark as read failed');
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
      setList((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: false } : n)));
    }
  };

  const sorted = useMemo(
    () => [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [list]
  );

  const dropdownUI = (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0" aria-hidden onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-heading"
        tabIndex={-1}
        className={`
          fixed
          inset-x-0 top-0
          h-[100dvh] w-full
          bg-white
          sm:inset-auto sm:top-16 sm:right-6 sm:w-96 sm:h-auto
          sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-emerald-100
          outline-none
          flex flex-col
          pt-[env(safe-area-inset-top)]
          pb-[env(safe-area-inset-bottom)]
        `}
      >
        {/* Accent bar to match brand */}
        <div className="h-1 bg-gradient-to-r from-emerald-700 to-emerald-500 sm:rounded-t-2xl" />

        {/* Header (sticky on mobile) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <h2
            id="notifications-heading"
            className="text-base font-semibold text-emerald-700 tracking-tight"
          >
            Notifications
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 rounded active:scale-[0.98] transition-transform"
            aria-label="Close notifications"
            title="Close"
          >
            <XCircle className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Scrollable list area */}
        <div className="p-3 overflow-y-auto flex-1 sm:max-h-[400px]">
          {sorted.length === 0 ? (
            <div className="text-sm text-gray-500 px-1 py-2">No new notifications</div>
          ) : (
            <ul role="list" className="space-y-3">
              {sorted.map((n) => {
                const t = coerceType(n.type);
                return (
                  <li
                    key={n._id}
                    role="listitem"
                    className={`
                      flex items-start gap-3 p-3 rounded-xl border transition
                      ${
                        n.isRead
                          ? 'bg-white border-gray-200 hover:border-gray-300'
                          : 'bg-emerald-50 border-emerald-100 hover:border-emerald-200'
                      }
                    `}
                  >
                    <div className="mt-0.5">{iconFor(t)}</div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 break-words">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>

                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n._id)}
                          className="mt-2 text-xs text-emerald-700 hover:underline hover:scale-[1.02] transition-transform duration-150"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(n._id)}
                        className="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 rounded transition-transform duration-150 hover:scale-105 active:scale-95"
                        aria-label="Delete notification"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer (sticky at bottom on mobile) */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white sticky bottom-0">
          <Link
            href="/profile/notifications"
            className="inline-flex items-center justify-center w-full
                       text-sm font-medium
                       text-emerald-700
                       hover:underline hover:scale-[1.02]
                       transition-transform duration-150
                       focus:outline-none focus:ring-2 focus:ring-emerald-300 rounded"
          >
            See all recent activity
          </Link>
        </div>
      </motion.div>
    </div>
  );
  if (!mounted) return null;
  return createPortal(dropdownUI, document.body);
}
