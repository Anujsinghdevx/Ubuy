import { api } from '@/lib/http';
import { Auction } from './types';

export const fetchAuctions = async (): Promise<Auction[]> => {
  const { data } = await api.get<Auction[]>('/api/auction/all');
  return data;
};
