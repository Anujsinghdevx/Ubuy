import Auction from '@/models/Auction';

export const autoCloseExpiredAuctions = async () => {
  const now = new Date();
  const result = await Auction.updateMany(
    { status: 'active', endTime: { $lte: now } },
    { $set: { status: 'closed' } }
  );
  console.log(`Auto-closed ${result.modifiedCount} auctions`);
};
