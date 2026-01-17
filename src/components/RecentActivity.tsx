'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, PlusCircleIcon, PackageOpenIcon } from 'lucide-react';
import axios from 'axios';

// Type Definitions

interface Activity {
  _id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
}

enum ActivityType {
  WIN = 'win',
  CREATE = 'create',
}

//  Helper Functions

const extractTitle = (message: string): string => {
  const match = message.match(/"(.*?)"/);
  return match ? match[1] : 'Untitled Auction';
};

const getIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.WIN:
      return (
        <div className="flex flex-col items-center" aria-label="Won auction">
          <CheckCircleIcon className="text-green-600 w-6 h-6" />
          <p className="text-xs text-green-600">Won</p>
        </div>
      );
    case ActivityType.CREATE:
      return (
        <div className="flex flex-col items-center" aria-label="Created auction">
          <PlusCircleIcon className="text-blue-600 w-6 h-6" />
          <p className="text-xs text-blue-600">Created</p>
        </div>
      );
    default:
      return null;
  }
};

//  Component

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/notification');
        const data = res.data.notifications as Activity[];

        const filtered = data
          .filter((a) => a.type === ActivityType.WIN || a.type === ActivityType.CREATE)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        setActivities(filtered);
      } catch (err) {
        console.error('Failed to load activities', err);
        setError('Unable to load recent activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <section className="bg-white border-2 border-gray-200 shadow-lg rounded-xl p-6 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-4"
      >
        <h3 className="text-xl font-bold text-gray-900">Recent Auction Activity</h3>
      </motion.div>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center text-gray-500 mt-4">
          <PackageOpenIcon
            className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-gray-400 mb-2"
            aria-hidden="true"
          />
          <p>No recent activity. Participate in auctions to see updates here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const title = extractTitle(activity.message);
            const displayMessage =
              activity.type === ActivityType.WIN
                ? `Won on ${title}`
                : activity.type === ActivityType.CREATE
                  ? `Created ${title}`
                  : title;

            return (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg shadow hover:shadow-md hover:bg-gray-100 transition"
              >
                <div className="p-2 bg-emerald-100 rounded-full">{getIcon(activity.type)}</div>

                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">{displayMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
