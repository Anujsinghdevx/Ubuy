'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface HeroSectionProps {
  session?: Session;
}

export const HeroSection = ({ session }: HeroSectionProps) => {
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden bg-gradient-to-b from-emerald-700 to-emerald-500 shadow-lg h-[80vh] flex items-center px-4"
    >
      {/* Background Blur Animation */}
      <div className="absolute -top-32 left-52 w-[600px] h-[600px] bg-amber-300 opacity-20 blur-3xl z-0 animate-[blob_8s_infinite]" />

      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: [20, -10, 20] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="w-full md:w-1/2 flex justify-center md:justify-start mb-8 md:mb-0  "
        >
          <Image
            src="/hero.png"
            alt="Hero Auction Banner"
            width={350}
            height={300}
            className="w-full max-w-[500px] h-auto object-cover drop-shadow-2xl"
          />
        </motion.div>

        {/* Text & Actions */}
        <div className="w-full md:w-1/2 text-white text-center md:text-left">
          {session ? (
            <>
              <motion.h1
                custom={0}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Welcome back, {session.user.name || 'Valued Bidder'}!
              </motion.h1>
              <motion.p
                custom={1}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-lg text-gray-200 mb-6"
              >
                Ready to place your next winning bid or list something new?
              </motion.p>
            </>
          ) : (
            <>
              <motion.h1
                custom={0}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Bid, Win & Own Unique Items
              </motion.h1>
              <motion.p
                custom={1}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-lg text-gray-200 mb-6"
              >
                Join live auctions and get the best deals.
              </motion.p>
            </>
          )}

          {/* Call to Action Buttons */}
          <motion.div
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center md:justify-start gap-4"
          >
            {session ? (
              <>
                <Button className="bg-emerald-800 hover:cursor-pointer text-base p-2 sm:p-4 hover:scale-105 hover:shadow-lg transition-transform duration-200">
                  Start Bidding
                </Button>
                <Button
                  variant="outline"
                  className="text-emerald-600 hover:cursor-pointer border-white hover:bg-gray-300 hover:text-emerald-800 hover:scale-105 hover:shadow-md transition-all duration-200"
                >
                  Sell an Item
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button className="bg-emerald-800 hover:cursor-pointer text-base p-2 sm:p-4 hover:scale-105 hover:shadow-lg transition-transform duration-200">
                    Login to Bid
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    variant="outline"
                    className="text-emerald-600 hover:cursor-pointer border-white hover:bg-gray-300 hover:text-emerald-800 hover:scale-105 hover:shadow-md transition-all duration-200"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
