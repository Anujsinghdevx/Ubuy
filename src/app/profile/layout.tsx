'use client';

import ProfileSidebar from '@/components/ProfileSidebar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <ProfileSidebar />
      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
