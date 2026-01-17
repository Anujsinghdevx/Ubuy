'use client';

import { useEffect, useState } from 'react';
import AuctionCard from '@/components/AuctionCard';
import Filters from '@/components/Filters';
import FilterDrawer from '@/components/FilterDrawer';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AuctionCardSkeleton from '@/components/Skeleton/AuctionCardSkeleton';

const ITEMS_PER_PAGE = 9;

type Auction = {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'closed';
  category: string;
  currentPrice: number;
  images: string[];
  startingPrice: number;
  endTime: string;
};

export default function AllAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [quickPriceFilter, setQuickPriceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [, setSortOption] = useState('endingSoon');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch('/api/auction/all');
        const data = await res.json();
        setAuctions(data);
      } catch (err) {
        console.error('Error fetching auctions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const filteredAuctions = auctions
    .filter(
      (a) =>
        (a.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (a.description?.toLowerCase() || '').includes(search.toLowerCase())
    )
    .filter((a) => statusFilter === 'all' || a.status === statusFilter)
    .filter((a) => categoryFilter === 'All' || a.category === categoryFilter)
    .filter((a) => {
      if (quickPriceFilter === 'under500') return a.currentPrice <= 500;
      if (quickPriceFilter === '500to1000') return a.currentPrice > 500 && a.currentPrice <= 1000;
      if (quickPriceFilter === 'above1000') return a.currentPrice > 1000;
      return a.currentPrice <= priceRange || priceRange === 0;
    });

  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
  const currentAuctions = filteredAuctions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full mx-auto px-6 sm:px-12 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters (PC) */}
        <aside className="hidden lg:block p-4 space-y-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Filters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            quickPriceFilter={quickPriceFilter}
            setQuickPriceFilter={setQuickPriceFilter}
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

        {/* Auctions Grid */}
        <main className="lg:col-span-3">
          {/* Search Bar */}
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
                  <p className="text-gray-500">No auctions found.</p>
                ) : (
                  currentAuctions.map((auction) => (
                    <AuctionCard key={auction._id} auction={auction} />
                  ))
                )}
              </div>

              {/* Pagination */}
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
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          quickPriceFilter={quickPriceFilter}
          setQuickPriceFilter={setQuickPriceFilter}
          setSearch={setSearch}
          setSortOption={setSortOption}
        />
      </FilterDrawer>
    </div>
  );
}
