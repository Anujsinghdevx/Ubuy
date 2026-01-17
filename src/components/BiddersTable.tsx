'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Bidder {
  _id: string;
  amount: number;
  bidTime: string;
  bidderName: string;
}

export default function BiddersTable({ bidders }: { bidders: Bidder[] }) {
  const [sortedBidders, setSortedBidders] = useState<Bidder[]>([]);

  useEffect(() => {
    const sorted = [...bidders].sort((a, b) => {
      if (b.amount === a.amount) {
        return new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime();
      }
      return b.amount - a.amount;
    });
    setSortedBidders(sorted.slice(0, 5));
  }, [bidders]);

  return (
    <div className="w-full overflow-x-auto  shadow-md bg-white">
      <table className="min-w-full text-sm sm:text-base">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="p-2 text-left">Bidder</th>
            <th className="p-2 text-right">Amount</th>
            <th className="p-2 text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {sortedBidders.length > 0 ? (
            sortedBidders.map((bid, index) => (
              <motion.tr
                key={bid._id}
                className="hover:bg-gray-100 transition-colors border-b"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <td className="p-2 font-medium text-gray-800 flex items-center ">
                  {index === 0 && <span title="Top Bid"></span>}
                  {bid.bidderName || 'Anonymous'}
                </td>
                <td className="p-2 text-green-600 font-semibold text-right">₹{bid.amount}</td>
                <td className="p-2 text-gray-500 text-right">
                  {new Date(bid.bidTime).toLocaleString('en-IN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                No bids yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
