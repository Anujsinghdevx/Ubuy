import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import Auction from '@/models/Auction';
import { autoCloseExpiredAuctions } from '@/lib/autoCloseExpiredAuctions';
import '@/models/User';
import '@/models/AuthUser';
import Notification from '@/models/Notification';

interface Bidder {
  bidder: {
    _id: string;
    username?: string;
    email?: string;
    provider?: string;
  };
  bidderModel?: string;
  amount: number;
}

export async function GET() {
  try {
    await dbConnect();

    // Automatically close expired auctions
    await autoCloseExpiredAuctions();

    // Fetch auctions sorted by endTime descending
    const auctions = await Auction.find().sort({ endTime: -1 });

    // Manually populate both createdBy and bidders.bidder (polymorphic)
    await Auction.populate(auctions, [
      {
        path: 'createdBy',
        select: 'username email provider',
      },
      {
        path: 'bidders.bidder',
        select: 'username email provider',
      },
    ]);

    // Filter for closed auctions that haven’t been notified
    const closedAuctions = auctions.filter(
      (auction) => auction.status === 'closed' && !auction.notified
    );

    for (const auction of closedAuctions) {
      if (!auction.bidders || auction.bidders.length === 0) continue;

      // Sort the bidders by amount (highest bid wins)
      const sortedBidders = (auction.bidders as Bidder[]).sort((a, b) => b.amount - a.amount);
      const winner = sortedBidders[0];

      if (winner?.bidder?._id && winner?.bidderModel) {
        // Create a win notification for the winner
        await Notification.create({
          recipient: winner.bidder._id,
          recipientModel: winner.bidderModel,
          type: 'win',
          message: `🎉 Congratulations! You have won the auction for "${auction.title}".`,
          relatedAuction: auction._id,
        });

        // Update the auction with the winner's ID in the 'winner' field
        await Auction.updateOne({ _id: auction._id }, { $set: { winner: winner.bidder._id } });
      }

      // Mark the auction as notified
      auction._doc.notified = true;
      await Auction.updateOne({ _id: auction._id }, { $set: { notified: true } });
    }

    return NextResponse.json(auctions, { status: 200 });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to fetch auctions', details: errorMessage },
      { status: 500 }
    );
  }
}
