'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Flame } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type MegaAuctionProps = {
  initialDuration?: number; // Countdown duration in seconds
  label?: string; // Section heading text
  urgentThreshold?: number; // Time (in seconds) to highlight urgency
  criticalThreshold?: number; // Time (in seconds) to trigger shake effect
  resetOnExpire?: boolean; // Restart after expiry
  onExpire?: () => void; // Callback when expired
  className?: string;
};

const DEFAULT_DURATION = 12 * 60 * 60;

function formatHMS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
  const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const secs = String(s % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function toISODuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const parts = ['PT'];
  if (hours) parts.push(`${hours}H`);
  if (minutes) parts.push(`${minutes}M`);
  parts.push(`${seconds}S`);
  return parts.join('');
}

export default function MegaAuction({
  initialDuration = DEFAULT_DURATION,
  label = 'Mega Auction Ends In:',
  urgentThreshold = 10 * 60,
  criticalThreshold = 5,
  resetOnExpire = true,
  onExpire,
  className = '',
}: MegaAuctionProps) {
  const reduceMotion = useReducedMotion();

  const endTimeRef = useRef<number | null>(null);
  const expiredOnceRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);

  useEffect(() => {
    endTimeRef.current = Date.now() + initialDuration * 1000;
    expiredOnceRef.current = false;
    setTimeLeft(initialDuration);
  }, [initialDuration]);

  useEffect(() => {
    function tick() {
      if (!endTimeRef.current) return;
      const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);

      if (remaining <= 0) {
        setTimeLeft(0);

        if (!expiredOnceRef.current) {
          expiredOnceRef.current = true;
          onExpire?.();
        }

        if (resetOnExpire) {
          endTimeRef.current = Date.now() + initialDuration * 1000;
          expiredOnceRef.current = false;
          setTimeLeft(initialDuration);
        } else if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        setTimeLeft(remaining);
      }
    }

    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialDuration, onExpire, resetOnExpire]);

  const isUrgent = timeLeft <= urgentThreshold;
  const isCritical = timeLeft <= criticalThreshold;

  const isoDuration = useMemo(() => toISODuration(timeLeft), [timeLeft]);
  const display = useMemo(() => formatHMS(timeLeft), [timeLeft]);

  const flameAnimate = reduceMotion ? {} : { scale: [1, 1.1, 0.98, 1], opacity: [1, 0.95, 1, 1] };

  const flameTransition = reduceMotion
    ? {}
    : { repeat: Infinity, repeatType: 'loop' as const, duration: 1.6, ease: 'easeInOut' };

  const timeAnimate = reduceMotion ? {} : isCritical ? { x: [0, -2, 2, -2, 2, 0] } : {};

  const timeTransition = reduceMotion
    ? {}
    : isCritical
      ? { duration: 0.5, ease: 'easeInOut', repeat: 0 }
      : {};

  return (
    <motion.section
      aria-labelledby="mega-auction-timer"
      initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`bg-emerald-800 text-white py-8 text-center ${className}`}
    >
      <h2
        id="mega-auction-timer"
        className="text-2xl sm:text-3xl flex justify-center items-center font-bold mb-2"
      >
        <motion.span
          animate={flameAnimate}
          transition={flameTransition}
          className="mr-2 inline-flex"
        >
          <Flame className="w-8 h-8 sm:w-10 sm:h-10 fill-amber-400 text-orange-500" />
        </motion.span>
        {label}
      </h2>

      <motion.time
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        dateTime={isoDuration}
        key={timeLeft}
        animate={timeAnimate}
        transition={timeTransition}
        className={[
          'font-semibold',
          'text-3xl sm:text-4xl md:text-5xl',
          isUrgent ? 'text-red-300' : 'text-white',
          'transition-colors duration-300',
        ].join(' ')}
      >
        {display}
      </motion.time>

      <p className="mt-4 px-4 max-w-2xl mx-auto">
        Hurry up — grab your favorite items before time runs out!
      </p>

      <div className="mt-6 mx-auto w-24 h-[2px] bg-white/40 transition-all duration-300 hover:w-32" />

      <span className="sr-only">
        Countdown showing hours, minutes, and seconds remaining until the auction ends.
      </span>
    </motion.section>
  );
}
