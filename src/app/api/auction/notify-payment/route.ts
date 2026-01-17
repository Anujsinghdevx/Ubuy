import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import Auction from '@/models/Auction';
import Notification from '@/models/Notification';
import '@/models/User';
import '@/models/AuthUser';
import axios from 'axios';

interface Bidder {
  bidder: {
    _id: string;
    email?: string;
    provider?: string;
  };
  bidderModel: 'User' | 'AuthUser';
  amount: number;
  bidderName: string;
}

interface PopulatedAuction {
  _id: string;
  title: string;
  status: string;
  currentPrice?: number;
  startingPrice?: number;
  category: string;
  createdBy: {
    _id: string;
    username: string;
    email?: string;
    provider?: string;
  };
  bidders: Bidder[];
}

export async function POST(req: Request) {
  try {
    const { auctionId } = await req.json();

    if (!auctionId) {
      return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
    }

    await dbConnect();

    const auction = await Auction.findById(auctionId).populate([
      {
        path: 'createdBy',
        select: 'username email provider',
      },
      {
        path: 'bidders.bidder',
        select: 'username email provider',
      },
    ]);

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    if (auction.status !== 'closed') {
      return NextResponse.json({ error: 'Auction is not closed yet' }, { status: 400 });
    }

    if (!auction.bidders || auction.bidders.length === 0) {
      return NextResponse.json({ error: 'No bidders in this auction' }, { status: 400 });
    }

    const sortedBidders: Bidder[] = (auction as PopulatedAuction).bidders.sort(
      (a, b) => b.amount - a.amount
    );
    const winner = sortedBidders[0];

    if (!winner.bidderModel) {
      console.error('Missing bidderModel for winner:', winner);
      return NextResponse.json({ error: "Winner's bidderModel is missing!" }, { status: 400 });
    }

    if (!winner || !winner.bidder?._id) {
      return NextResponse.json({ error: 'No winner found' }, { status: 400 });
    }

    // Update paymentStatus to 'ACTIVE' before creating payment link
    await Auction.updateOne({ _id: auction._id }, { $set: { paymentStatus: 'ACTIVE' } });

    // Create a payment link using Cashfree Payment Links API
    const paymentLinkPayload = {
      link_id: `auction_${auction._id}_${Date.now()}`,
      link_amount: auction.currentPrice || auction.startingPrice || 100,
      link_currency: 'INR',
      link_purpose: `Payment for auction: ${auction.title}`,
      customer_details: {
        customer_name: winner.bidderName || 'Unknown User',
        customer_email: winner.bidder.email || 'noemail@example.com',
        customer_phone: '9999999999',
      },
      link_expiry_time: '2025-06-30T23:59:59+05:30', // 1 month expiry
      link_notify: {
        send_email: true,
        send_sms: false,
      },
      link_auto_reminders: true,
      link_notes: {
        auction_id: auction._id.toString(),
        category: auction.category,
      },
      link_meta: {
        return_url: 'https://localhost:3000/auctions',
      },
    };

    const cashfreeResponse = await axios.post(
      'https://sandbox.cashfree.com/pg/links',
      paymentLinkPayload,
      {
        headers: {
          'x-client-id': process.env.CASHFREE_CLIENT_ID!,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
          'x-api-version': '2025-01-01',
          'Content-Type': 'application/json',
          'x-idempotency-key': `auction_${auction._id}_${Date.now()}`,
        },
      }
    );

    console.log('Cashfree Payment Link response:', cashfreeResponse.data);

    const payment_link = cashfreeResponse.data.link_url;

    if (!payment_link) {
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }

    console.log('Payment link created:', payment_link);

    // ✅ Create a new notification for the winner
    await Notification.create({
      recipient: winner.bidder._id,
      recipientModel: winner.bidderModel,
      type: 'payment',
      message: `🪙 Please complete your payment for winning the auction: "${auction.title}". <a href="${payment_link}" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Pay here</a>`,
      relatedAuction: auction._id,
    });

    return NextResponse.json(
      {
        message: 'Payment link sent to winner!',
        payment_link,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to notify payment', details: (error as Error).message },
      { status: 500 }
    );
  }
}
