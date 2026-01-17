'use client';

import { Menu, Bell, ChevronLeft, BadgeIndianRupee, User, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/profile/notifications', icon: Bell, label: 'Notifications' },
    { href: '/profile/my-auction', icon: BadgeIndianRupee, label: 'Created Auction' },
    { href: '/profile/wishlist', icon: Heart, label: 'Wishlist' },
  ];

  return (
    <div className="flex min-h-[80vh] bg-white relative overflow-visible">
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3 }}
        className="bg-emerald-100 shadow-lg flex flex-col gap-4 py-4 overflow-visible relative"
      >
        <div className="flex flex-col items-center md:items-start px-2">
          <div className="relative group w-full hidden sm:block">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mb-4 flex items-center justify-center sm:justify-start w-full p-2 hover:bg-emerald-200 rounded-full transition"
              aria-label="Toggle Panel"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
              ) : (
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
              )}
            </button>

            {isCollapsed && (
              <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
              </div>
            )}
          </div>

          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <div key={idx} className="relative group w-full">
                <Link
                  href={item.href}
                  className={`flex items-center justify-center sm:justify-start gap-2 w-full p-2 rounded-md transition-colors
                  ${isActive ? 'bg-emerald-300 text-emerald-800 font-semibold' : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-200'}
        `}
                >
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      isActive
                        ? 'text-emerald-800 fill-emerald-500'
                        : 'text-gray-700 group-hover:text-emerald-700'
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>

                {isCollapsed && (
                  <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.aside>
    </div>
  );
}
