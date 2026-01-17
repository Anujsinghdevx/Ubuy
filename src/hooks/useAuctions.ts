import { useQuery } from '@tanstack/react-query';
import { fetchAuctions } from '@/features/auctions/api';

export const useAuctions = () => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['auctions'],
    queryFn: fetchAuctions,
    staleTime: 30_000,
  });

  if (isError) {
    console.error('Error fetching auctions', error);
  }

  return { auctions: data ?? [], loading: isPending };
};
