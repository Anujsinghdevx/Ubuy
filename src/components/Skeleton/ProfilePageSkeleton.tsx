import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 bg-gray-50 p-6 min-h-screen">
      {/* Left Side */}
      <div className="flex flex-col gap-6 w-full lg:w-2/3 h-full">
        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-4" />
            <Skeleton className="h-4 w-32 mb-2" /> {/* Joined Date */}
            <Skeleton className="h-6 w-40 mb-2" /> {/* Name */}
            <Skeleton className="h-4 w-48 mb-4" /> {/* Email */}
            <div className="flex justify-center gap-4 w-full">
              <Skeleton className="h-10 w-1/3 rounded-full" />
              <Skeleton className="h-10 w-1/3 rounded-full" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border-2 border-gray-200 shadow-lg rounded-xl p-6 flex-grow">
          <Skeleton className="h-6 w-1/2 mx-auto mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auction Stats */}
      <div className="w-full lg:w-1/3 max-w-xl">
        <div className="flex flex-col justify-between h-full p-6 bg-white border-2 border-gray-200 shadow-lg rounded-xl">
          <Skeleton className="h-8 w-2/3 mx-auto mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-6">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>

          <Skeleton className="h-10 w-40 mx-auto rounded-full mb-4" />

          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-2/3 mx-auto" />
            <div className="flex justify-center flex-wrap gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
