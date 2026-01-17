'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type NewsletterProps = {
  className?: string;
  heading?: string;
  subheading?: string;
};

export default function Newsletter({
  className = '',
  heading = 'Stay Updated!',
  subheading = 'Subscribe to our newsletter to get the latest auction alerts.',
}: NewsletterProps) {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Subscribed successfully!');
    setEmail('');
  }

  return (
    <motion.section
      aria-labelledby="newsletter-heading"
      initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`bg-emerald-500 text-white py-12 px-6 text-center ${className}`}
    >
      <h2 id="newsletter-heading" className="text-2xl sm:text-3xl font-semibold mb-3">
        {heading}
      </h2>
      <p id="newsletter-desc" className="mb-6 opacity-90">
        {subheading}
      </p>

      <form
        onSubmit={handleSubmit}
        aria-describedby="newsletter-desc"
        noValidate
        className="mx-auto flex w-full max-w-xl flex-col sm:flex-row items-stretch justify-center gap-3"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 bg-white rounded-md text-emerald-700 w-full sm:w-72 placeholder:text-gray-400"
        />

        <motion.div
          whileHover={reduceMotion ? {} : { scale: 1.02 }}
          whileTap={reduceMotion ? {} : { scale: 0.98 }}
          className="shrink-0"
        >
          <Button
            type="submit"
            className="bg-white hover:cursor-pointer text-emerald-700 hover:bg-emerald-100"
          >
            Subscribe
          </Button>
        </motion.div>
      </form>
    </motion.section>
  );
}
