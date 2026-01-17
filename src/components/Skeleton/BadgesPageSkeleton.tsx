import { MedalIcon, Hammer, Trophy, Gavel } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function BadgesPageSkeleton() {
  const renderSkeletonSection = (Icon: React.ElementType, title: string) => (
    <section className="mb-12">
      <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 mb-2">
        <Icon className="text-gray-300 w-6 h-6" />
        <div className="bg-gray-200 h-5 w-48 rounded" />
        {/* Optionally show the title as visually hidden for accessibility */}
        <span className="sr-only">{title}</span>
      </h2>
      <div className="text-sm text-gray-400 mb-2 h-4 w-40 bg-gray-100 rounded" />

      <div className="relative w-full h-2 bg-gray-200 rounded mb-4 overflow-hidden">
        <div className="absolute left-0 top-0 h-full bg-emerald-200 w-1/3 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center text-center p-2 bg-white rounded-md shadow-sm animate-pulse"
          >
            <div className="bg-gray-200 w-16 h-16 rounded-full mb-2" />
            <div className="bg-gray-200 h-4 w-20 rounded mt-1" />
            <div className="bg-gray-100 h-3 w-24 rounded mt-1" />
            <div className="bg-gray-100 h-3 w-16 rounded mt-1" />
          </motion.div>
        ))}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <Card className="max-w-5xl mx-auto animate-pulse">
        <CardHeader>
          <h1 className="text-3xl font-bold text-center mb-2 flex justify-center items-center gap-2">
            <MedalIcon className="text-emerald-400 w-7 h-7" />
            <div className="bg-gray-200 h-6 w-40 rounded" />
          </h1>
          <p className="text-center text-gray-400 max-w-xl mx-auto text-sm h-4 bg-gray-100 rounded w-3/4" />
        </CardHeader>

        <CardContent>
          {renderSkeletonSection(Hammer, 'Auction Creation Badges')}
          {renderSkeletonSection(Trophy, 'Auction Win Badges')}
          {renderSkeletonSection(Gavel, 'Bidding Badges')}
        </CardContent>
      </Card>
    </main>
  );
}
