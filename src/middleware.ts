import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/sign-in',
    },
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/profile/:path*', '/create-auction', '/bidded-auctions'],
};
