import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
          {/* Icon Skeleton */}
          <Skeleton className="w-12 h-12 rounded-full" />

          {/* Message and Date Skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>

          {/* Delete Icon Skeleton */}
          <Skeleton className="w-6 h-6" />
        </div>
      ))}
    </div>
  );
}
