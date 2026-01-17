// utils/time.ts
export const getRemainingTime = (endTime: string): string => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const diff = end - now;

  if (diff <= 0) return 'Closed';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
};
