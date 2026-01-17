import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import Auction from '@/models/Auction';
import Notification from '@/models/Notification';
import '@/models/User';
import '@/models/AuthUser';
import axios from 'axios';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const linkId = url.searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    // Extract the auctionId from linkId (assuming the format is 'auction_<auctionId>_<timestamp>')
    const auctionId = linkId.split('_')[1]; // The auctionId is the second part

    // Fetch Cashfree payment link status
    const cashfreeResponse = await axios.get(`https://sandbox.cashfree.com/pg/links/${linkId}`, {
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2025-01-01',
      },
    });

    // Check if the payment was successful
    if (cashfreeResponse.data.link_status !== 'PAID') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    // Fetch the auction using the auctionId extracted from the linkId
    const auction = await Auction.findOne({
      _id: auctionId, // Find the auction by its ID
      status: 'closed', // Ensure it's a closed auction
      winner: { $exists: true, $ne: null }, // Ensure there's a winner
    });

    // Check if auction exists
    if (!auction) {
      return NextResponse.json({ error: 'Auction not found for this payment' }, { status: 404 });
    }
    console.log('Auction found:', auction);

    // Fetch the winner's details from either User or AuthUser model
    let winner = null;
    if (auction.winner) {
      // First, check in the User model
      winner = await User.findById(auction.winner);
      if (!winner) {
        // If not found in User, check in the AuthUser model
        winner = await AuthUser.findById(auction.winner);
      }
    }

    // If winner is not found
    if (!winner) {
      return NextResponse.json(
        { error: 'Winner not found in the User or AuthUser model' },
        { status: 404 }
      );
    }

    // Log winner details
    console.log('Winner details:', winner);

    // Compare the winner's email with the customer_email from Cashfree response
    if (winner.email !== cashfreeResponse.data.customer_details.customer_email) {
      return NextResponse.json(
        { error: "Winner's email does not match Cashfree response" },
        { status: 400 }
      );
    }

    // Update the auction with the payment status set to "PAID"
    await Auction.updateOne({ _id: auction._id }, { $set: { paymentStatus: 'PAID' } });

    // Send a notification to the winner for successful payment
    try {
      const notification = await Notification.create({
        recipient: winner._id,
        recipientModel: winner instanceof User ? 'User' : 'AuthUser',
        type: 'payment',
        message: `🎉 Your payment for the auction "${auction.title}" has been successfully received. Thank you for your participation!`,
        relatedAuction: auction._id,
      });

      console.log('Notification sent:', notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }

    // Return payment link status
    return NextResponse.json(
      {
        message: 'Payment link status fetched successfully',
        status: cashfreeResponse.data.link_status,
        data: cashfreeResponse.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching payment link status:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch payment link status',
        details:
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : String(error),
      },
      { status: 500 }
    );
  }
}
