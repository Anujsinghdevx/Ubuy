import { Auction } from './types';

export const fetchAuctions = async (): Promise<Auction[]> => {
  const res = await fetch('/api/auction/all', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string })?.error || 'Failed to fetch auctions');
  if (Array.isArray(data)) return data as Auction[];
  return ((data as { data?: Auction[]; auctions?: Auction[] })?.data ??
    (data as { data?: Auction[]; auctions?: Auction[] })?.auctions ??
    []) as Auction[];
};
