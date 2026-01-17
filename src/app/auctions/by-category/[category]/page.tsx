'use client';

import CategoryAuctionsPage from '@/components/Category';
import { useParams } from 'next/navigation';

export default function CategoryPage() {
  const params = useParams();
  const category = decodeURIComponent((params?.category ?? '') as string);

  return <CategoryAuctionsPage category={category} />;
}
