'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FileTextIcon, LockIcon, AlertTriangleIcon, LucideIcon } from 'lucide-react';

type Policy = {
  title: string;
  desc: string;
  Icon: LucideIcon;
  accentClass: string;
};

const POLICIES: Policy[] = [
  {
    title: 'User Agreement',
    desc: 'By using our platform, you agree to abide by our rules, respect other users, and participate in fair, legal bidding activities.',
    Icon: FileTextIcon,
    accentClass: 'text-blue-600',
  },
  {
    title: 'Privacy Policy',
    desc: 'Your data is collected securely and used only to enhance your experience and process transactions. We never sell your information.',
    Icon: LockIcon,
    accentClass: 'text-purple-600',
  },
  {
    title: 'Prohibited Activities',
    desc: 'Users are prohibited from engaging in fraud, misrepresentation, unauthorized use of accounts, or attempting to manipulate auctions.',
    Icon: AlertTriangleIcon,
    accentClass: 'text-red-600',
  },
];

export default function Page() {
  const reduceMotion = useReducedMotion();

  return (
    <main
      role="main"
      className="max-w-6xl mx-auto p-6 sm:p-10 space-y-14"
      aria-labelledby="terms-heading"
    >
      <motion.header
        initial={reduceMotion ? {} : { opacity: 0, y: 50 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 id="terms-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-800">
          Terms &amp; Conditions
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Please carefully read these terms and conditions before using TechSaviour’s services.
        </p>
      </motion.header>

      <motion.section
        aria-labelledby="policies-heading"
        initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <h2 id="policies-heading" className="text-2xl sm:text-3xl font-bold text-gray-800">
          Key Terms &amp; Policies
        </h2>

        <ul className="grid grid-cols-1 gap-6">
          {POLICIES.map(({ title, desc, Icon, accentClass }) => (
            <li key={title}>
              <motion.article
                whileHover={reduceMotion ? {} : { y: -2, scale: 1.01 }}
                whileTap={reduceMotion ? {} : { scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-4 bg-white p-6 rounded-xl shadow ring-1 ring-gray-100 hover:shadow-md"
              >
                <span aria-hidden="true" className="p-3 bg-emerald-50 rounded-full inline-flex">
                  <Icon className={`w-6 h-6 ${accentClass}`} />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h3>
                  <p className="text-gray-600 mt-1">{desc}</p>
                </div>
              </motion.article>
            </li>
          ))}
        </ul>
      </motion.section>
    </main>
  );
}
