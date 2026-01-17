'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { Menu, X, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import NotificationDropdown, { type Notification } from './NotificationDropdown';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();
  const pathname = usePathname();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notification');
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (session) fetchNotifications();
  }, [session]);

  const handleToggleNotifications = async () => {
    // When opening, mark as read then refresh
    if (!notificationsOpen && session) {
      try {
        await axios.get('/api/notification/read');
        await fetchNotifications();
      } catch (error) {
        console.error('Error marking/fetching notifications:', error);
      }
    }
    setNotificationsOpen((prev) => !prev);
  };

  const isActive = (href: string) => pathname === href;

  const navLinkClass = (href: string) =>
    `inline-block transition-all duration-150 hover:underline hover:underline-offset-4 ${
      isActive(href) ? 'font-semibold underline underline-offset-4' : ''
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full px-8 sm:px-16 z-50 p-6 shadow-md bg-emerald-600 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold" aria-label="Home">
          <h1 className="sm:text-4xl text-3xl font-bold text-slate-100 font-sans">U-Buy</h1>
        </Link>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center space-x-4">
          {session && (
            <button
              onClick={handleToggleNotifications}
              className="relative p-2 hover:bg-emerald-700 rounded-full group"
              aria-label="Toggle notifications"
            >
              <Bell className="text-white w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Notifications
              </div>
            </button>
          )}
          <button
            className="text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex text-base items-center space-x-8">
          {session ? (
            <>
              <Link href="/auctions" className={navLinkClass('/auctions')}>
                Auctions
              </Link>
              <Link href="/create-auction" className={navLinkClass('/create-auction')}>
                Create Auction
              </Link>
              <Link href="/bidded-auctions" className={navLinkClass('/bidded-auctions')}>
                Bidded Auctions
              </Link>
              <Link href="/profile" className={navLinkClass('/profile')}>
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button className="bg-emerald-800 hover:cursor-pointer text-base p-2 sm:p-4 hover:scale-105 hover:shadow-lg transition-transform duration-200">
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  className="text-emerald-600 hover:cursor-pointer border-white hover:bg-gray-300 hover:text-emerald-800 hover:scale-105 hover:shadow-md transition-all duration-200"
                  variant="outline"
                >
                  Sign-Up
                </Button>
              </Link>
            </>
          )}

          {session && (
            <button
              onClick={handleToggleNotifications}
              className="relative p-2 hover:bg-emerald-700 rounded-full group"
              aria-label="Toggle notifications"
            >
              <Bell className="text-white w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Notifications
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-64 bg-emerald-700 text-white flex flex-col p-6 space-y-4 md:hidden z-50"
        aria-label="Mobile navigation drawer"
      >
        <button
          className="self-end mb-4"
          onClick={() => setIsOpen(false)}
          aria-label="Close drawer"
        >
          <X size={24} />
        </button>
        {session ? (
          <>
            <Link
              href="/auctions"
              onClick={() => setIsOpen(false)}
              className={navLinkClass('/auctions')}
            >
              Auctions
            </Link>
            <Link
              href="/create-auction"
              onClick={() => setIsOpen(false)}
              className={navLinkClass('/create-auction')}
            >
              Create Auction
            </Link>
            <Link
              href="/bidded-auctions"
              onClick={() => setIsOpen(false)}
              className={navLinkClass('/bidded-auctions')}
            >
              Bidded Auctions
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className={navLinkClass('/profile')}
            >
              Profile
            </Link>
          </>
        ) : (
          <>
            <Link href="/sign-in" onClick={() => setIsOpen(false)}>
              <Button
                className="bg-slate-100 hover:cursor-pointer w-full text-emerald-600"
                variant="outline"
              >
                Login
              </Button>
            </Link>
            <Link href="/sign-up" onClick={() => setIsOpen(false)}>
              <Button
                className="bg-slate-100 hover:cursor-pointer w-full text-emerald-600"
                variant="outline"
              >
                Sign-Up
              </Button>
            </Link>
          </>
        )}
      </motion.div>
      {notificationsOpen && session && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setNotificationsOpen(false)}
        />
      )}
    </nav>
  );
}

export default Navbar;
