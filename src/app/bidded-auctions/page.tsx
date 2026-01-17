'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Filters from '@/components/Filters';
import FilterDrawer from '@/components/FilterDrawer';
import AuctionCardSkeleton from '@/components/Skeleton/AuctionCardSkeleton';

interface Auction {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  highestBidder?: string;
  startTime: string;
  category: string;
  endTime: string;
  status: 'active' | 'closed';
  createdBy: string;
  winnerId?: string;
}

interface PaymentLinkResponse {
  payment_link?: string;
  error?: string;
}

const ITEMS_PER_PAGE = 9;

export default function BiddedAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOption, setSortOption] = useState('endingSoon');
  const [showFilters, setShowFilters] = useState(false);

  const { data: session } = useSession();
  const myUserId = session?.user?.id;

  useEffect(() => {
    const fetchBiddedAuctions = async () => {
      try {
        const res = await fetch('/api/auction/bidded-auction');
        const data = await res.json();
        if (Array.isArray(data.biddedAuctions)) {
          setAuctions(data.biddedAuctions);
        } else {
          toast.error(data.error || 'Failed to fetch bidded auctions');
        }
      } catch (err) {
        console.error('Error fetching bidded auctions', err);
        toast.error('Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchBiddedAuctions();
  }, []);

  const handleAuctionClick = (auctionId: string) => {
    window.location.href = `/auctions/${auctionId}`;
  };

  const handlePayHere = async (auctionId: string) => {
    try {
      setProcessing(auctionId);
      toast.loading('Generating payment link...', { id: 'payment' });

      const res = await fetch('/api/auction/notify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId }),
      });

      const data: PaymentLinkResponse = await res.json();
      toast.dismiss('payment');

      if (res.ok && data.payment_link) {
        toast.success('Redirecting...');
        window.location.href = data.payment_link;
      } else {
        toast.error(data.error || 'Failed to generate payment link.');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss('payment');
      toast.error('Something went wrong.');
    } finally {
      setProcessing(null);
    }
  };

  const filteredAuctions = auctions
    .filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
    )
    .filter((a) => statusFilter === 'all' || a.status === statusFilter)
    .filter((a) => categoryFilter === 'All' || a.category === categoryFilter)
    .sort((a, b) => {
      if (sortOption === 'endingSoon') {
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      } else if (sortOption === 'newest') {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
  const currentAuctions = filteredAuctions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full mx-auto px-6 sm:px-12 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block p-4 space-y-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Filters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priceRange={0}
            setPriceRange={() => {}}
            quickPriceFilter=""
            setQuickPriceFilter={() => {}}
            setSearch={setSearch}
            setSortOption={setSortOption}
          />
        </aside>

        {/* Mobile Filters Toggle */}
        <div className="block lg:hidden mb-4">
          <Button
            onClick={() => setShowFilters(true)}
            className="w-full bg-emerald-500 text-white rounded-full"
          >
            Show Filters
          </Button>
        </div>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Search */}
          <div className="mb-6">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <Input
                type="text"
                placeholder="Search auctions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm rounded-xl border border-emerald-400 focus:ring-emerald-400 w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <AuctionCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentAuctions.length === 0 ? (
                  <p className="text-gray-500">You haven&apos;t placed any bids yet.</p>
                ) : (
                  currentAuctions.map((auction) => (
                    <Card
                      key={auction._id}
                      className="relative min-w-80 bg-white/10 border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden"
                    >
                      <CardContent className="p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">{auction.title}</h2>
                        <p className="text-gray-700">{auction.description}</p>

                        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
                          {auction.images?.[0] && (
                            <Image
                              src={auction.images[0]}
                              alt={auction.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          )}
                        </div>

                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>Start:</strong>{' '}
                            {new Date(auction.startTime).toLocaleString('en-GB')}
                          </p>
                          <p>
                            <strong>End:</strong>{' '}
                            {new Date(auction.endTime).toLocaleString('en-GB')}
                          </p>
                          <p>
                            <strong>Status:</strong> {auction.status}
                          </p>
                          <p>
                            <strong>Current Price:</strong> ₹{auction.currentPrice}
                          </p>
                        </div>

                        <Button
                          className="w-full mt-2 bg-emerald-500 text-white hover:bg-emerald-600"
                          onClick={() => handleAuctionClick(auction._id)}
                        >
                          View Auction Details
                        </Button>

                        {auction.status === 'closed' && auction.winnerId === myUserId && (
                          <Button
                            className="w-full mt-2 bg-purple-600 text-white hover:bg-purple-700"
                            disabled={processing === auction._id}
                            onClick={() => handlePayHere(auction._id)}
                          >
                            {processing === auction._id ? (
                              <>
                                <Loader2 className="animate-spin mr-2" size={18} />
                                Redirecting...
                              </>
                            ) : (
                              'Pay Here'
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Pagination */}
              {filteredAuctions.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center mt-10 space-x-4">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-700">{`Page ${currentPage} of ${totalPages}`}</span>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      <FilterDrawer isOpen={showFilters} onClose={() => setShowFilters(false)}>
        <Filters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priceRange={0}
          setPriceRange={() => {}}
          quickPriceFilter=""
          setQuickPriceFilter={() => {}}
          setSearch={setSearch}
          setSortOption={setSortOption}
        />
      </FilterDrawer>
    </div>
  );
}
