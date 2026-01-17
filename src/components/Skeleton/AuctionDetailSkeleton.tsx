import { Skeleton } from '@/components/ui/skeleton';

export default function AuctionDetailSkeleton() {
  return (
    <div className="mx-auto p-4 sm:p-6 lg:px-16 lg:py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Image Viewer */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-4">
          {/* Thumbnails */}
          <div className="flex lg:flex-col sm:gap-2 overflow-x-auto lg:overflow-y-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 flex-shrink-0 rounded border" />
            ))}
          </div>

          {/* Main Image */}
          <Skeleton className="flex-1 aspect-[4/3] w-full rounded-lg border" />
        </div>

        {/* Right Side - Auction Info + Bidders Table */}
        <div className="space-y-6">
          {/* Title and Description */}
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          {/* Tag Info */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
          </div>

          {/* Creator Info */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border p-4 bg-white shadow-sm">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            <Skeleton className="w-40 h-10 rounded-full" />
          </div>

          {/* Bid Input and Quick Bid */}
          <div className="pt-4 space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Skeleton className="w-full sm:w-40 h-12 rounded-full" />

              <div className="flex flex-col sm:flex-row bg-emerald-500 p-3 rounded-2xl w-full sm:w-auto gap-3">
                <Skeleton className="h-5 w-36 sm:w-48 bg-white/20" />
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-20 rounded-full bg-white/30" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Auction ended message skeleton */}
          <Skeleton className="h-6 w-1/3 mt-2" />

          {/* Bidders Table Skeleton */}
          <div className="border rounded-lg overflow-hidden shadow-sm bg-white w-full">
            <h2 className="bg-gray-100 border flex justify-center px-4 py-2 font-semibold tracking-wide text-xl md:text-2xl">
              <Skeleton className="h-6 w-48" />
            </h2>
            <table className="min-w-full text-sm sm:text-base">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="p-2 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="p-2 text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </th>
                  <th className="p-2 text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="p-2 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </td>
                    <td className="p-2 text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
