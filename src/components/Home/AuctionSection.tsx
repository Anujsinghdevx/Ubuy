'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, Keyboard } from 'swiper/modules';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import AuctionCard from '@/components/AuctionCard';
import AuctionCardSkeleton from '../Skeleton/AuctionCardSkeleton';
import { Auction } from '@/features/auctions/types';

import 'swiper/css';
import 'swiper/css/navigation';

type AuctionSectionProps = {
  auctions: Auction[];
  loading: boolean;
  title?: string;
  className?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export const AuctionSection = ({
  auctions,
  loading,
  title = 'Live Auctions',
  className = '',
  viewAllHref = '/auctions',
  viewAllLabel = 'View all',
}: AuctionSectionProps) => {
  const reduceMotion = useReducedMotion();

  const activeAuctions = useMemo(() => auctions.filter((a) => a.status !== 'closed'), [auctions]);

  return (
    <section
      aria-labelledby="live-auctions-heading"
      className={`relative overflow-hidden bg-gray-50 py-12 px-6 ${className}`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 z-0 opacity-10 sm:opacity-5 pointer-events-none">
        <Image
          src="/topography.svg"
          alt=""
          aria-hidden="true"
          role="presentation"
          fill
          priority={false}
          quality={70}
          sizes="100vw"
          className="object-cover object-[20%_0%]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header with desktop "View all" */}
        <div className="mb-6 flex items-center justify-between px-2 sm:px-0">
          <h2
            id="live-auctions-heading"
            className="text-2xl sm:text-3xl font-semibold text-emerald-800 flex items-center"
          >
            {title}
            <span aria-label="Live" className="relative ml-2 inline-flex">
              <span
                className="p-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"
                aria-hidden="true"
              />
              <span className="sr-only">Live</span>
            </span>
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))}
          </div>
        ) : activeAuctions.length === 0 ? (
          <p className="text-gray-600 px-2 sm:px-0">No live auctions available.</p>
        ) : (
          <div className="w-full">
            <Swiper
              modules={[Navigation, A11y, Keyboard]}
              navigation
              keyboard={{ enabled: true }}
              a11y={{
                prevSlideMessage: 'Previous auctions',
                nextSlideMessage: 'Next auctions',
                slideRole: 'group',
              }}
              slidesPerView={1}
              spaceBetween={20}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="py-2"
            >
              {activeAuctions.map((auction) => (
                <SwiperSlide key={auction._id}>
                  <motion.div
                    initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
                    whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    <motion.div
                      whileHover={reduceMotion ? {} : { y: -4 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="h-full"
                    >
                      <AuctionCard auction={auction} />
                    </motion.div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Bottom "View all" CTA (desktop/tablet) */}
        <div className="hidden sm:flex justify-center mt-8">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={`${viewAllLabel} auctions`}
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>

      {/* Mobile floating "View all" CTA (sticky edge) */}
      <div className="sm:hidden absolute right-4 bottom-2 z-20">
        <Link
          href={viewAllHref}
          className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label={`${viewAllLabel} auctions`}
        >
          {viewAllLabel}
        </Link>
      </div>
    </section>
  );
};
