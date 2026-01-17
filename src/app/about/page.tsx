'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BadgePercent,
  Hammer,
  HammerIcon,
  ShieldCheck,
  ShieldCheckIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import Head from 'next/head';

const MotionLink = motion.create(Link);

export default function AboutPage() {
  const { data: session } = useSession();

  const features = [
    {
      icon: <BadgePercent size={32} className="text-emerald-600" />,
      title: 'Best Deals',
      desc: 'Unlock incredible auction deals on premium products.',
      color: 'bg-emerald-100',
    },
    {
      icon: <Hammer size={32} className="text-rose-600" />,
      title: 'Live Auctions',
      desc: 'Experience real-time bidding with live price updates.',
      color: 'bg-rose-100',
    },
    {
      icon: <ShieldCheck size={32} className="text-indigo-600" />,
      title: 'Trusted & Secure',
      desc: 'Your transactions are protected and fully transparent.',
      color: 'bg-indigo-100',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-16 ">
      <Head>
        <title>About Ubuy | Trusted Online Auctions</title>
        <meta
          name="description"
          content="Learn more about Ubuy's mission, secure auction features, and how to start bidding today."
        />
        <meta property="og:title" content="About Ubuy" />
        <meta
          property="og:description"
          content="Discover Ubuy's benefits, features, and how to win amazing deals via online auctions."
        />
        <link rel="canonical" href="https://ubuy-theta.vercel.app//about" />
      </Head>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center px-6 max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-extrabold text-emerald-800 mb-4">Welcome to Ubuy</h1>
        <p className="text-gray-600 text-lg mb-10">
          Your trusted online auction platform for amazing deals, unique products, and secure
          transactions. Join thousands of happy bidders today!
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 max-w-6xl mx-auto"
      >
        {features.map((feature, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className={`rounded-2xl shadow-lg p-6 ${feature.color} flex flex-col items-center text-center`}
          >
            <div className="p-3 rounded-full bg-white mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="bg-white mt-20 py-12 px-6 text-center"
      >
        <h2 className="text-2xl font-semibold text-emerald-800 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <UsersIcon className="text-emerald-700" size={32} />,
              title: 'Create Account',
              desc: 'Quickly sign up and dive into the action.',
            },
            {
              icon: <HammerIcon className="text-emerald-700" size={32} />,
              title: 'Join Auctions',
              desc: 'Find live auctions and place your bids.',
            },
            {
              icon: <TrophyIcon className="text-emerald-700" size={32} />,
              title: 'Win Big',
              desc: 'Beat the competition and secure your deals.',
            },
            {
              icon: <ShieldCheckIcon className="text-emerald-700" size={32} />,
              title: 'Pay Securely',
              desc: 'Complete transactions through our secure system.',
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center shadow-md"
            >
              <div className="p-3 bg-white rounded-full shadow-sm mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Conditional CTA section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        {session ? (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-20 px-6 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome Back to Ubuy, {session.user?.name || 'Bidder'}!
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-200">
              Ready to win your next great deal? Explore live auctions, outbid your rivals, and
              claim exclusive offers reserved for our members.
            </p>
            <MotionLink
              href="/auctions"
              whileHover={{ scale: 1.05 }}
              className="inline-block px-8 py-4 text-emerald-600 bg-white font-semibold rounded-xl shadow-lg"
            >
              Go to Live Auctions
              <span className="inline-block p-1.5 ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </MotionLink>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-20 px-6 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Start Bidding Today!</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of happy bidders on Ubuy — secure deals, beat competitors, and enjoy a
              safe auction experience.
            </p>
            <MotionLink
              href="/sign-up"
              whileHover={{ scale: 1.05 }}
              className="inline-block px-8 py-4 text-emerald-600 bg-white font-semibold rounded-xl shadow-lg"
            >
              Join U-Buy Now
            </MotionLink>
          </motion.section>
        )}
      </motion.section>
    </div>
  );
}
