'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import React, { useMemo, useState } from 'react';

type CategoryItem = { title: string; icon: string; href?: string };

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { title: 'Electronics', icon: '/Electronics.png' },
  { title: 'Collectibles', icon: '/Collectibles.png' },
  { title: 'Art', icon: '/Art.png' },
  { title: 'Fashion', icon: '/Fashion.png' },
];

type CategoriesProps = {
  categories?: CategoryItem[];
  className?: string;
  heading?: string;
};

export default function Categories({
  categories = DEFAULT_CATEGORIES,
  className = '',
  heading = 'Explore Categories',
}: CategoriesProps) {
  const reduceMotion = useReducedMotion();

  const items = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        href: c.href ?? `/auctions/by-category/${encodeURIComponent(c.title)}`,
      })),
    [categories]
  );

  return (
    <motion.section
      aria-labelledby="categories-heading"
      initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`bg-white py-12 px-6 ${className}`}
    >
      <h2
        id="categories-heading"
        className="text-3xl sm:text-4xl font-semibold text-emerald-800 mb-8 text-center"
      >
        {heading}
      </h2>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {items.map((category) => (
          <CategoryCard
            key={category.title}
            title={category.title}
            icon={category.icon}
            href={category.href!}
          />
        ))}
      </ul>
    </motion.section>
  );
}

function CategoryCard({ title, icon, href }: { title: string; icon: string; href: string }) {
  const reduceMotion = useReducedMotion();
  const [pressWave, setPressWave] = useState(0);

  return (
    <li className="h-full">
      <Link
        href={href}
        aria-label={`Browse ${title} auctions`}
        className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <motion.div
          onTapStart={() => !reduceMotion && setPressWave((n) => n + 1)}
          whileHover={reduceMotion ? {} : { y: -4, scale: 1.02 }}
          whileTap={reduceMotion ? {} : { scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative p-5 rounded-xl bg-gray-100 shadow-md ring-1 ring-gray-200/60 hover:shadow-lg hover:ring-emerald-200 h-full touch-manipulation active:scale-[0.99]"
        >
          {/* Touch ripple (centered), disabled for reduced motion */}
          {!reduceMotion && (
            <motion.span
              key={pressWave}
              className="pointer-events-none absolute inset-0 rounded-xl"
              initial={{ scale: 0, opacity: 0.25 }}
              animate={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{
                background:
                  'radial-gradient(120px 120px at center, rgba(16,185,129,0.18), rgba(16,185,129,0.0) 60%)',
              }}
            />
          )}

          <Image
            src={icon}
            alt={`${title} category`}
            width={250}
            height={150}
            sizes="(max-width: 768px) 45vw, (max-width: 1024px) 22vw, 250px"
            loading="lazy"
            className="mx-auto mb-3 select-none pointer-events-none"
          />
          <p className="text-gray-900 text-lg sm:text-xl font-semibold">{title}</p>
          <span
            aria-hidden="true"
            className="mt-3 block h-0.5 w-12 mx-auto bg-emerald-500/70 scale-x-0 group-hover:scale-x-100 group-active:scale-x-100 transition-transform duration-300 origin-center"
          />
        </motion.div>
      </Link>
    </li>
  );
}
