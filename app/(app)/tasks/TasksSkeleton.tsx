import Navigation from '@/components/Navigation';

export function TasksSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="h-7 bg-muted rounded w-28 animate-pulse mb-1"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-9 w-28 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-9 w-16 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex border-b border-border mb-6">
          <div className="h-9 w-12 bg-muted rounded animate-pulse mr-4"></div>
          <div className="h-9 w-14 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Search/Filters Skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-9 w-[240px] bg-muted rounded-lg animate-pulse"></div>
          <div className="flex gap-3 ml-auto">
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="border-b border-border p-3 flex gap-4">
            <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto"></div>
            <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-border p-3 flex items-center gap-4">
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-72 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-14 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-14 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
