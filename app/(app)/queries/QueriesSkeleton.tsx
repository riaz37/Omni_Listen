import { MessageSquare } from 'lucide-react';

export function QueriesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Additional Analysis History</h1>
        </div>
        <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
      </div>

      {/* Search & Filter Skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-12 bg-muted rounded-lg animate-pulse" />
        <div className="h-12 w-36 bg-muted rounded-lg animate-pulse" />
        <div className="h-12 w-36 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card-2 rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <div className="h-3 w-32 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="h-3 w-24 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-muted rounded animate-pulse mb-1" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse mb-1" />
              <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
