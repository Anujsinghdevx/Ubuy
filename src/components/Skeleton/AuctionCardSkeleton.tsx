import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuctionCardSkeleton() {
  return (
    <Card className="relative bg-white border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden">
      {/* Heart Icon Placeholder */}
      <div className="absolute top-3 left-3 z-10">
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>

      {/* Time Badge Placeholder */}
      <div className="absolute top-3 right-3 z-10">
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>

      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-full" /> {/* Description */}
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="w-full aspect-[4/3] rounded-lg" /> {/* Image */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="pt-2 space-y-2">
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
