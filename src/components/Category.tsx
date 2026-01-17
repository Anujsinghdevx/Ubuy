'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import AuctionCard from '@/components/AuctionCard';
import Filters from '@/components/Filters';
import FilterDrawer from '@/components/FilterDrawer';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AuctionCardSkeleton from './Skeleton/AuctionCardSkeleton';

const ITEMS_PER_PAGE = 9;

interface Auction {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'closed';
  category: string;
  currentPrice: number;
  images: string[];
  startingPrice: number;
  endTime: string;
}

interface CategoryAuctionsProps {
  category: string;
}

const CategoryAuctionsPage: React.FC<CategoryAuctionsProps> = ({ category }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [quickPriceFilter, setQuickPriceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [, setSortOption] = useState('endingSoon');

  const lastFetchedCategoryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!category) {
      setAuctions([]);
      return;
    }
    if (lastFetchedCategoryRef.current === category) return;
    lastFetchedCategoryRef.current = category;

    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/auction/bycategory?category=${encodeURIComponent(category)}`,
          { signal: ac.signal }
        );

        if (!res.ok) {
          let msg = `Failed to load auctions (status ${res.status})`;
          try {
            const body = await res.json();
            if (body?.error) msg = body.error;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();
        setAuctions(Array.isArray(data) ? data : (data?.data ?? []));
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'name' in err && err.name === 'AbortError')
          return;
        console.error('Error fetching category auctions', err);
        toast.error((err as Error)?.message || 'Failed to load auctions for this category.');
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [category]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, priceRange, quickPriceFilter]);

  const filteredAuctions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return auctions
      .filter((a) =>
        q
          ? (a.title?.toLowerCase() || '').includes(q) ||
            (a.description?.toLowerCase() || '').includes(q)
          : true
      )
      .filter((a) => (statusFilter === 'all' ? true : a.status === statusFilter))
      .filter((a) => (categoryFilter === 'All' ? true : a.category === categoryFilter))
      .filter((a) => {
        if (quickPriceFilter === 'under500') return a.currentPrice <= 500;
        if (quickPriceFilter === '500to1000') return a.currentPrice > 500 && a.currentPrice <= 1000;
        if (quickPriceFilter === 'above1000') return a.currentPrice > 1000;
        return priceRange === 0 ? true : a.currentPrice <= priceRange;
      });
  }, [auctions, search, statusFilter, categoryFilter, priceRange, quickPriceFilter]);

  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);

  const currentAuctions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAuctions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAuctions, currentPage]);

  const setStatusFilterAsString = (v: string) => setStatusFilter(v as 'all' | 'active' | 'closed');

  const setCategoryFilterAsString = (v: string) => setCategoryFilter(v);
  const setPriceRangeAsNumber = (n: number) => setPriceRange(n);
  const setQuickPriceFilterAsString = (v: string) => setQuickPriceFilter(v);
  const setSearchAsString = (v: string) => setSearch(v);
  const setSortOptionAsString = (v: string) => setSortOption(v);

  return (
    <div className="w-full mx-auto px-6 sm:px-12 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block p-4 space-y-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Filters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilterAsString}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilterAsString}
            priceRange={priceRange}
            setPriceRange={setPriceRangeAsNumber}
            quickPriceFilter={quickPriceFilter}
            setQuickPriceFilter={setQuickPriceFilterAsString}
            setSearch={setSearchAsString}
            setSortOption={setSortOptionAsString}
          />
        </aside>

        {/* Auctions List */}
        <main className="lg:col-span-3">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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

          {/* Mobile Filters Toggle */}
          <div className="block lg:hidden mb-4">
            <Button
              onClick={() => setShowFilters(true)}
              className="w-full bg-emerald-500 text-white rounded-full"
            >
              Show Filters
            </Button>
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
              {totalPages > 1 && (
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
          setStatusFilter={setStatusFilterAsString}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilterAsString}
          priceRange={priceRange}
          setPriceRange={setPriceRangeAsNumber}
          quickPriceFilter={quickPriceFilter}
          setQuickPriceFilter={setQuickPriceFilterAsString}
          setSearch={setSearchAsString}
          setSortOption={setSortOptionAsString}
        />
      </FilterDrawer>
    </div>
  );
};

export default CategoryAuctionsPage;
