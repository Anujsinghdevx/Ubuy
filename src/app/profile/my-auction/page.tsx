'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import Link from 'next/link';
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
  endTime: string;
  status: 'active' | 'closed';
  createdBy: string;
}

const ITEMS_PER_PAGE = 6;

const MyAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAuctions = useCallback(async () => {
    try {
      const res = await fetch('/api/auction/myauction');
      const data = await res.json();

      if (Array.isArray(data)) {
        setAuctions(data);
      } else {
        toast.error(data.error || 'Failed to fetch auctions');
        setAuctions([]);
      }
    } catch (err) {
      console.error('Error fetching auctions', err);
      toast.error('Something went wrong while fetching auctions.');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCloseAuction = async (auctionId: string) => {
    try {
      const res = await fetch('/api/auction/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to close auction');

      toast.success('Auction closed successfully!');
      fetchAuctions();
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDeleteAuction = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch('/api/auction/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: deleteId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to delete auction');

      toast.success('Auction deleted successfully!');
      setDeleteId(null);
      fetchAuctions();
    } catch {
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Pagination logic
  const indexOfLastAuction = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstAuction = indexOfLastAuction - ITEMS_PER_PAGE;
  const currentAuctions = auctions.slice(indexOfFirstAuction, indexOfLastAuction);
  const totalPages = Math.ceil(auctions.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-sm sm:w-full px-8 sm:px-4 max-w-6xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <AuctionCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
            {currentAuctions.length === 0 ? (
              <p className="text-gray-500 text-center">
                <span className="text-xl font-semibold text-gray-700">
                  Looks like you don&apos;t have any auctions yet!
                </span>
                <br />
                <span>
                  How about starting one? It&apos;s easy, fun, and you never know what amazing items
                  might go live!
                </span>
                <br />
                <Link href="/create-auction">
                  <Button className="mt-4 bg-emerald-500 text-white hover:bg-emerald-600">
                    Create Your Auction Now
                  </Button>
                </Link>
              </p>
            ) : (
              currentAuctions.map((auction) => (
                <Card
                  key={auction._id}
                  className="relative bg-white/10 border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden transition-transform transform "
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="absolute cursor-pointer top-2 right-2 p-2 rounded-full text-red-500 hover:bg-red-100"
                        onClick={() => setDeleteId(auction._id)}
                      >
                        <Trash2Icon
                          className="inline-block  w-6 h-6 sm:w-7 sm:h-7 text-red-500 hover:text-red-600"
                          style={{ width: '1.5rem', height: '1.5rem' }}
                        />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Auction?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Are you sure you want to delete this
                          auction?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                          onClick={handleDeleteAuction}
                        >
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">{auction.title}</h2>
                    <p className="text-gray-700">{auction.description}</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {auction.images && auction.images.length > 0 && (
                        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
                          <Image
                            src={auction.images[0]}
                            alt={auction.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Start:</strong> {new Date(auction.startTime).toLocaleString()}
                      </p>
                      <p>
                        <strong>End:</strong> {new Date(auction.endTime).toLocaleString()}
                      </p>
                      <p>
                        <strong>Status:</strong> {auction.status}
                      </p>
                      <p>
                        <strong>Current Price:</strong> ₹{auction.currentPrice}
                      </p>
                    </div>

                    {auction.status === 'active' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full mt-4 bg-red-500 text-white hover:bg-red-600">
                            Close Auction
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Closing this auction will prevent any further bids. This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleCloseAuction(auction._id)}
                            >
                              Yes, close it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Explore Auction Button */}
                    <Link href={`/auctions/${auction._id}`} passHref>
                      <Button className="w-full cursor-pointer  bg-indigo-500 text-white hover:bg-indigo-600">
                        Explore Auction
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination controls */}
          {auctions.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center mt-8 space-x-4">
              <Button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="text-gray-700 font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
              <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyAuctionsPage;
