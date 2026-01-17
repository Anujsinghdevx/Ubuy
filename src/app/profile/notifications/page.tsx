'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  GavelIcon,
  InfoIcon,
  Trash2Icon,
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import NotificationSkeleton from '@/components/Skeleton/NotificationSkeleton';
interface Notification {
  _id: string;
  type: 'bid' | 'win' | 'close' | 'admin' | 'general';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  //function for deleting a notification
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/notification/${id}`);
      setNotifications((prev) => prev.filter((note) => note._id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  // Fetch notifications from the API when the component mounts
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notification');
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'bid':
        return (
          <div className="flex flex-col items-center">
            <GavelIcon className="text-indigo-600" />
            <p className="text-sm sm:text-base text-indigo-600 ">Bid</p>
          </div>
        );
      case 'win':
        return (
          <div className="flex flex-col items-center">
            <CheckCircleIcon className="text-green-600" />
            <p className="text-sm sm:text-base text-green-600 ">Win</p>
          </div>
        );
      case 'close':
        return (
          <div className="flex flex-col items-center">
            <XCircleIcon className="text-red-600" />
            <p className="text-sm sm:text-base text-red-600 ">Close</p>
          </div>
        );
      case 'admin':
        return (
          <div className="flex flex-col items-center">
            <InfoIcon className="text-yellow-600" />
            <p className="text-sm sm:text-base text-yellow-600 ">Admin</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <BellIcon className="text-emerald-600 " />
            <p className="text-sm text-emerald-600 ">General</p>
          </div>
        );
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Back to Profile Button */}
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated on your auction activity</p>
      </motion.div>

      <div className="space-y-4">
        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500">No notifications yet</div>
        ) : (
          notifications.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex xs:flex-row items-center justify-center gap-2 xs:gap-4 bg-white p-3 xs:p-4 rounded-lg shadow hover:shadow-md transition-all ${
                note.isRead ? 'opacity-60' : ''
              }`}
            >
              <div className="p-2 bg-emerald-100 flex items-center justify-center rounded-full">
                {getIcon(note.type)}
              </div>
              <div className="flex-1 ">
                <p
                  className="text-gray-800 font-medium"
                  dangerouslySetInnerHTML={{ __html: note.message }}
                />
                <p className="text-xs xs:text-sm text-gray-500 mt-1">
                  {new Date(note.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(note._id)}
                className="ml-auto hover:cursor-pointer p-2 text-red-500 hover:text-red-700"
                title="Delete notification"
                aria-label="Delete notification"
              >
                <Trash2Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
