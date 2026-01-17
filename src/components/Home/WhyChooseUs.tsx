'use client';

import React from 'react';
import { ShieldCheckIcon, UserIcon, HammerIcon, LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type ReasonItem = {
  title: string;
  desc: string;
  Icon: LucideIcon;
};

type WhyChooseUsProps = {
  reasons?: ReasonItem[];
  heading?: string;
  className?: string;
};

const DEFAULT_REASONS: ReasonItem[] = [
  {
    title: 'Secure Payments',
    desc: 'Your transactions are safe and encrypted.',
    Icon: ShieldCheckIcon,
  },
  {
    title: 'Verified Sellers',
    desc: 'We onboard only trusted and quality sellers.',
    Icon: UserIcon,
  },
  { title: '24/7 Support', desc: 'Our team is always here to assist you.', Icon: HammerIcon },
];

export default function WhyChooseUs({
  reasons = DEFAULT_REASONS,
  heading = 'Why Choose Us?',
  className = '',
}: WhyChooseUsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      aria-labelledby="why-heading"
      initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`bg-white py-12 px-6 text-center ${className}`}
    >
      <h2 id="why-heading" className="text-2xl sm:text-3xl font-semibold text-emerald-800 mb-8">
        {heading}
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {reasons.map(({ title, desc, Icon }) => (
          <li key={title}>
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px 0px' }}
              whileHover={reduceMotion ? {} : { y: -4, scale: 1.02 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md ring-1 ring-transparent hover:ring-emerald-200 text-center h-full focus-within:ring-emerald-300"
            >
              <motion.span
                aria-hidden="true"
                animate={reduceMotion ? {} : { y: [0, -2, 0] }}
                transition={
                  reduceMotion ? {} : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                }
                className="inline-flex items-center justify-center"
              >
                <Icon className="w-10 h-10 mx-auto text-emerald-600" />
              </motion.span>

              <h3 className="text-lg font-semibold mt-4 text-emerald-800">{title}</h3>
              <p className="text-gray-600 mt-2">{desc}</p>

              <span
                aria-hidden="true"
                className="mt-4 block h-0.5 w-12 mx-auto bg-emerald-500/70 scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              />
            </motion.div>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
