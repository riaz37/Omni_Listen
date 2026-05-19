'use client';

import Navigation from '@/components/Navigation';
import PageTransition from '@/components/ui/page-transition';
import '@/lib/boneyard-config';
// Import bones registry once generated: import './bones/registry';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
