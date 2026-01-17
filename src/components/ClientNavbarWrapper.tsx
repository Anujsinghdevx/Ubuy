'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { ReactNode } from 'react';

export default function ClientNavbarWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith('/sign-in') ||
    pathname?.startsWith('/sign-up') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/verify') ||
    pathname?.startsWith('/reset-password');

  return (
    <>
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <div className="h-20"></div>}
      {children}
      {!isAuthPage && <Footer />}
    </>
  );
}
