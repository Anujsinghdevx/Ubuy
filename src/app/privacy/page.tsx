'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockIcon,
  FileTextIcon,
  AlertTriangleIcon,
  UserIcon,
  LucideIcon,
} from 'lucide-react';

type Item = {
  title: string;
  desc: string;
  Icon: LucideIcon;
  accent?: string;
};

const HOW_IT_WORKS: Item[] = [
  {
    title: 'Account Registration',
    desc: 'Sign up with your secure details — all information is encrypted and confidential.',
    Icon: UserIcon,
    accent: 'text-emerald-600',
  },
  {
    title: 'Data Protection',
    desc: 'We securely store your personal and transactional data using advanced encryption.',
    Icon: LockIcon,
    accent: 'text-emerald-600',
  },
  {
    title: 'Privacy Assurance',
    desc: 'Your data is never shared without consent and is used only for improving our services.',
    Icon: ShieldCheckIcon,
    accent: 'text-emerald-600',
  },
];

const PRINCIPLES: Item[] = [
  {
    title: 'Data Collection',
    desc: 'We collect minimal, essential data needed to provide you a seamless auction experience, including your name, email, contact details, and bidding history.',
    Icon: FileTextIcon,
    accent: 'text-blue-600',
  },
  {
    title: 'No Unauthorised Sharing',
    desc: 'We do not sell, trade, or rent your personal information to third parties without your explicit consent, except where legally required.',
    Icon: AlertTriangleIcon,
    accent: 'text-red-600',
  },
  {
    title: 'Secure Storage',
    desc: 'All sensitive data is encrypted and stored with strict access controls to prevent unauthorized access or misuse.',
    Icon: LockIcon,
    accent: 'text-purple-600',
  },
];

export default function Page() {
  const reduceMotion = useReducedMotion();

  return (
    <main
      role="main"
      className="max-w-6xl mx-auto p-6 sm:p-10 space-y-14"
      aria-labelledby="privacy-heading"
    >
      {/* Hero */}
      <motion.header
        initial={reduceMotion ? {} : { opacity: 0, y: 50 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 id="privacy-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-800">
          Privacy Policy
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Your privacy is important to us. This page outlines how TechSaviour collects, uses, and
          protects your data.
        </p>
      </motion.header>

      {/* How It Works */}
      <motion.section
        aria-labelledby="how-heading"
        initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white py-12 px-6 text-center rounded-2xl shadow-sm ring-1 ring-gray-100"
      >
        <h2 id="how-heading" className="text-2xl font-semibold text-emerald-800 mb-6">
          How It Works
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ title, desc, Icon, accent }) => (
            <li key={title} className="flex flex-col items-center">
              <div className="p-4 bg-emerald-50 rounded-full mb-3">
                <Icon className={`${accent ?? ''} w-6 h-6`} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-800">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Principles */}
      <motion.section
        aria-labelledby="principles-heading"
        initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <h2 id="principles-heading" className="text-2xl sm:text-3xl font-bold text-gray-800">
          Our Privacy Principles
        </h2>

        <ul className="grid grid-cols-1 gap-6">
          {PRINCIPLES.map(({ title, desc, Icon, accent }) => (
            <li key={title}>
              <motion.article
                whileHover={reduceMotion ? {} : { y: -2, scale: 1.01 }}
                whileTap={reduceMotion ? {} : { scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-4 bg-white p-6 rounded-xl shadow ring-1 ring-gray-100 hover:shadow-md"
              >
                <span aria-hidden="true" className="p-3 bg-emerald-50 rounded-full inline-flex">
                  <Icon className={`w-6 h-6 ${accent ?? ''}`} />
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
